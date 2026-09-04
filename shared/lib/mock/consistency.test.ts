import { describe, expect, it } from 'vitest';
import { sessions } from './sessions';
import { getUser, users } from './store';
import { reviews } from './reviews';
import { redemptions, perks } from './perks';

/**
 * Cross-fixture invariants. If the user app and the admin app are to agree,
 * every reference in the dataset has to resolve.
 */
describe('fixture consistency', () => {
  it('teaches only skills the provider actually offers', () => {
    for (const s of sessions) {
      const provider = getUser(s.providerId);
      expect(provider, `unknown provider ${s.providerId} on ${s.id}`).toBeDefined();
      const offered = provider!.skillsOffered.map((k) => k.title);
      expect(offered, `${s.id}: ${provider!.name} does not offer "${s.requestedSkillTitle}"`).toContain(
        s.requestedSkillTitle
      );
    }
  });

  it('resolves every participant id, and stores names that match', () => {
    for (const s of sessions) {
      expect(getUser(s.requesterId), `${s.id} requester`).toBeDefined();
      expect(getUser(s.providerId), `${s.id} provider`).toBeDefined();
      // Session denormalises names (spec 2.5). They must not drift from the user record.
      expect(s.teacherName).toBe(getUser(s.providerId)!.name);
      expect(s.studentName).toBe(getUser(s.requesterId)!.name);
    }
  });

  it('gives scheduled and settled sessions a date and a location', () => {
    for (const s of sessions) {
      if (['scheduled', 'completed', 'reviewed'].includes(s.status)) {
        expect(s.scheduledDateTime, `${s.id} has no date`).toBeTruthy();
        expect(s.location.length, `${s.id} has no location`).toBeGreaterThan(0);
      }
    }
  });

  it('anchors every review to a real session and a real reviewee', () => {
    const ids = new Set(sessions.map((s) => s.id));
    for (const r of reviews) {
      expect(ids.has(r.sessionId), `review ${r.id} points at a missing session`).toBe(true);
      expect(getUser(r.revieweeId)).toBeDefined();
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    }
  });

  it('anchors every redemption to a real perk, user, and its listed cost', () => {
    for (const r of redemptions) {
      const perk = perks.find((p) => p.id === r.perkId);
      expect(perk, `redemption ${r.id} points at a missing perk`).toBeDefined();
      expect(r.karmaCost).toBe(perk!.karmaCost);
      expect(r.perkTitle).toBe(perk!.title);
      expect(getUser(r.userId)?.name).toBe(r.userName);
    }
  });

  it('gives every user unique ids and at least one offered skill', () => {
    expect(new Set(users.map((u) => u.id)).size).toBe(users.length);
    expect(new Set(sessions.map((s) => s.id)).size).toBe(sessions.length);
    for (const u of users) {
      expect(u.skillsOffered.length, `${u.name} offers nothing`).toBeGreaterThan(0);
    }
  });
});
