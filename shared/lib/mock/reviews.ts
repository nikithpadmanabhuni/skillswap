import type { Review } from '../types';
import { learnerOf, settledSessions, teacherOf } from './sessions';
import { userSeeds } from './users';

/**
 * One review per settled session, written by the learner about the teacher.
 * Generated rather than typed out for the same reason as the session history:
 * rating and reviewCount are DERIVED from this set (spec 2.4 — server-computed,
 * client-read-only), so a hand-written rating would immediately drift.
 */

const NAMES: Record<string, string> = Object.fromEntries(userSeeds.map((u) => [u.id, u.name]));

/**
 * Fixed rating pattern per teacher. Deterministic and reproducible: the same
 * teacher always draws the same sequence, so averages never move between loads.
 * Skewed high because a review only happens after a session someone chose to
 * attend, which is what real marketplace rating distributions look like.
 */
const RATING_CYCLE: Record<string, number[]> = {
  'u-003': [5, 5, 5, 4.5, 5],
  'u-011': [5, 5, 4.5, 5, 5],
  'u-007': [5, 4.5, 5, 5, 4.5],
  'u-002': [5, 5, 5, 5, 4.5],
  'u-016': [4.5, 5, 4.5, 5, 4.5],
  'u-020': [5, 4.5, 5, 4.5, 5],
  'u-me': [5, 4.5, 5, 5, 4.5],
  'u-018': [4, 4.5, 4, 4.5, 4],
  'u-026': [2, 1.5, 2, 2.5, 2],
  'u-025': [4, 4.5, 4, 4, 4.5],
  'u-023': [4, 4.5, 4.5, 4, 4.5]
};
const DEFAULT_CYCLE = [5, 4.5, 4.5, 5, 4];

const COMMENTS = [
  'Explained it in a way that finally made sense. Patient with the basics.',
  'Came prepared with a plan for the hour. Would swap again.',
  'Genuinely good teacher — did not just do it for me, made me work it out.',
  'Really clear, and happy to go over the bits I had not understood.',
  'Friendly, on time, and I left with something I could actually practise.',
  'Adapted when I said I was lost. That is harder than it sounds.',
  'Knows the subject cold. Slightly fast at first but slowed down when asked.',
  'Best hour I have spent on campus this term.'
];

const perTeacherIndex = new Map<string, number>();

export const reviews: Review[] = settledSessions.map((s, i) => {
  const revieweeId = teacherOf(s);
  const reviewerId = learnerOf(s);
  const n = perTeacherIndex.get(revieweeId) ?? 0;
  perTeacherIndex.set(revieweeId, n + 1);

  const cycle = RATING_CYCLE[revieweeId] ?? DEFAULT_CYCLE;

  return {
    id: `rev-${s.id}`,
    sessionId: s.id,
    reviewerId,
    reviewerName: NAMES[reviewerId] ?? reviewerId,
    revieweeId,
    rating: cycle[n % cycle.length],
    comment: COMMENTS[(i + n) % COMMENTS.length],
    skillName: s.requestedSkillTitle,
    createdAt: s.scheduledDateTime ?? '2026-06-01T12:00:00.000Z'
  };
});

export function reviewsFor(userId: string): Review[] {
  return reviews
    .filter((r) => r.revieweeId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
