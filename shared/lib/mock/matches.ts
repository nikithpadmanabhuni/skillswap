import { CATEGORY_LABELS, type PublicProfile, type Skill, type SwapMatch } from '../types';
import { currentUser, peers } from './store';

/**
 * Match feed generation for the fixtures.
 *
 * This is NOT a port of the Flutter MatchingEngine. That engine's value is its
 * fuzzy similarity (substring containment, 3+ character token overlap, category
 * fallback) and it belongs in the domain layer with the Dart test suite
 * translated alongside it -- spec 3.1 task 3.1, not UI work.
 *
 * What is reproduced here is only the SCORING and ORDERING from spec 2.2, over
 * exact skill-title matches:
 *   mutual  -> base 95, +5 when the peer rates 4.8 or higher
 *   one-way -> base 75, plus up to 15 scaled by peer rating
 *   results sort mutual-first, then by score descending
 *
 * Generating rather than hand-writing these keeps every reasoning string true of
 * the skill data it describes; a literal would drift the moment a skill changed.
 */

const MUTUAL_BASE = 95;
const MUTUAL_RATING_BONUS = 5;
const MUTUAL_RATING_THRESHOLD = 4.8;
const ONE_WAY_BASE = 75;
const ONE_WAY_RATING_SPAN = 15;

function findOffered(peer: PublicProfile, titles: string[]): Skill | undefined {
  return peer.skillsOffered.find((s) => titles.includes(s.title));
}

function findWanted(peer: PublicProfile, titles: string[]): Skill | undefined {
  return peer.skillsWanted.find((s) => titles.includes(s.title));
}

function buildMatch(peer: PublicProfile): SwapMatch | null {
  const myOffers = currentUser.skillsOffered.map((s) => s.title);
  const myWants = currentUser.skillsWanted.map((s) => s.title);

  // what they can teach me
  const theyOffer = findOffered(peer, myWants);
  // what I can teach them
  const theyWant = findWanted(peer, myOffers);

  const sameCampus = peer.campus === currentUser.campus;

  if (theyOffer && theyWant) {
    const score =
      MUTUAL_BASE + (peer.rating >= MUTUAL_RATING_THRESHOLD ? MUTUAL_RATING_BONUS : 0);
    return {
      targetUserId: peer.id,
      isMutual: true,
      matchPercentage: score,
      matchedOfferSkill: theyOffer,
      matchedWantSkill: theyWant,
      sameCampus,
      reasoning: `Direct swap: ${peer.name.split(' ')[0]} teaches you ${theyOffer.title} and wants to learn ${theyWant.title}, which you offer.${
        sameCampus ? ' Same campus.' : ''
      }`
    };
  }

  if (theyOffer) {
    const score = Math.round(ONE_WAY_BASE + ONE_WAY_RATING_SPAN * (peer.rating / 5));
    return {
      targetUserId: peer.id,
      isMutual: false,
      matchPercentage: score,
      matchedOfferSkill: theyOffer,
      sameCampus,
      reasoning: `Teaches ${theyOffer.title}, which is on your want list. Spend Karma to learn it.${
        sameCampus ? ' Same campus.' : ''
      }`
    };
  }

  if (theyWant) {
    const score = Math.round(ONE_WAY_BASE + ONE_WAY_RATING_SPAN * (peer.rating / 5));
    return {
      targetUserId: peer.id,
      isMutual: false,
      matchPercentage: score,
      matchedOfferSkill: theyWant,
      sameCampus,
      reasoning: `Wants to learn ${theyWant.title}, which you teach. Earn Karma for the session.${
        sameCampus ? ' Same campus.' : ''
      }`
    };
  }

  // Weak match: a shared skill category, the third tier of spec 2.2 similarity.
  const myCategories = new Set([
    ...currentUser.skillsOffered.map((s) => s.category),
    ...currentUser.skillsWanted.map((s) => s.category)
  ]);
  const shared = peer.skillsOffered.find((s) => myCategories.has(s.category));
  if (shared) {
    const score = Math.round(60 + 10 * (peer.rating / 5));
    return {
      targetUserId: peer.id,
      isMutual: false,
      matchPercentage: score,
      matchedOfferSkill: shared,
      sameCampus,
      reasoning: `Also active in ${CATEGORY_LABELS[shared.category]} — teaches ${shared.title}. No direct skill overlap yet.${
        sameCampus ? ' Same campus.' : ''
      }`
    };
  }

  return null;
}

/** Mutual first, then score descending, then id for a stable total order. */
export const matches: SwapMatch[] = peers
  .map(buildMatch)
  .filter((m): m is SwapMatch => m !== null)
  .sort((a, b) => {
    if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1;
    if (a.matchPercentage !== b.matchPercentage) return b.matchPercentage - a.matchPercentage;
    return a.targetUserId.localeCompare(b.targetUserId);
  });

export const mutualMatches = matches.filter((m) => m.isMutual);
