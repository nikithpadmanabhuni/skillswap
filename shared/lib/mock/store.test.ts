import { describe, expect, it } from 'vitest';
import { currentUser, getUser, peers, profiles, users } from './store';
import { reviews } from './reviews';
import { TARGET_LEARNED, TARGET_TAUGHT, settledSessions, teacherOf } from './sessions';
import { CURRENT_USER_ID } from './users';

describe('derived user store', () => {
  it('derives rating as the mean of that user reviews', () => {
    for (const u of users) {
      const mine = reviews.filter((r) => r.revieweeId === u.id);
      expect(u.reviewCount).toBe(mine.length);
      if (mine.length) {
        const mean = mine.reduce((s, r) => s + r.rating, 0) / mine.length;
        expect(u.rating).toBeCloseTo(Math.round(mean * 10) / 10, 5);
        expect(u.rating).toBeLessThanOrEqual(5);
      } else {
        expect(u.rating).toBe(0);
      }
    }
  });

  it('derives hoursTaught from settled sessions', () => {
    for (const u of users) {
      const hours = settledSessions
        .filter((s) => teacherOf(s) === u.id)
        .reduce((sum, s) => sum + s.durationHours, 0);
      expect(u.hoursTaught, u.name).toBe(hours);
    }
  });

  it('hits the declared teach/learn targets exactly', () => {
    // Guards the slot-pairing pre-pass: an inline fallback used to duplicate one
    // learner and drop another, which showed up only as an off-by-one in hours.
    for (const u of users) {
      expect(u.hoursTaught, `${u.name} taught`).toBe(TARGET_TAUGHT[u.id]);
      expect(u.hoursLearned, `${u.name} learned`).toBe(TARGET_LEARNED[u.id]);
    }
  });

  it('strips PII from the public projection', () => {
    for (const p of profiles as unknown as Record<string, unknown>[]) {
      expect(p.email).toBeUndefined();
      expect(p.phoneNumber).toBeUndefined();
      expect(p.notificationSettings).toBeUndefined();
    }
    // and the full record still has it, so the admin app can show it
    expect(getUser(CURRENT_USER_ID)?.email).toContain('@');
  });

  it('hides suspended accounts and self from the peer feed', () => {
    expect(peers.some((p) => p.id === CURRENT_USER_ID)).toBe(false);
    expect(peers.some((p) => p.status !== 'active')).toBe(false);
    expect(users.some((u) => u.status === 'suspended')).toBe(true);
  });

  it('gives the current user a coherent profile', () => {
    expect(currentUser.id).toBe(CURRENT_USER_ID);
    expect(currentUser.karmaBalance).toBeGreaterThan(0);
    expect(currentUser.skillsOffered.length).toBeGreaterThan(0);
    expect(currentUser.skillsWanted.length).toBeGreaterThan(0);
  });
});
