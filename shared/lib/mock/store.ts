import type { PublicProfile, User } from '../types';
import { balanceOf } from './karma';
import { reviews } from './reviews';
import { learnerOf, settledSessions, teacherOf } from './sessions';
import { CURRENT_USER_ID, userSeeds } from './users';

/**
 * Composition point. Every reputation field on a User is DERIVED here:
 *
 *   karmaBalance  <- the append-only ledger
 *   hoursTaught   <- settled sessions where the user was the provider
 *   hoursLearned  <- settled sessions where the user was the requester
 *   rating        <- running mean of reviews about the user
 *   reviewCount   <- count of those reviews
 *
 * Spec 2.4: "Rating, review count, and hours must be server-computed and
 * client-read-only. In the current app they are client-writable, which makes
 * reputation forgeable." Nothing in this file lets a caller set them.
 */

const taught = new Map<string, number>();
const learned = new Map<string, number>();

for (const s of settledSessions) {
  const t = teacherOf(s);
  const l = learnerOf(s);
  taught.set(t, (taught.get(t) ?? 0) + s.durationHours);
  learned.set(l, (learned.get(l) ?? 0) + s.durationHours);
}

const ratingSum = new Map<string, number>();
const ratingCount = new Map<string, number>();

for (const r of reviews) {
  ratingSum.set(r.revieweeId, (ratingSum.get(r.revieweeId) ?? 0) + r.rating);
  ratingCount.set(r.revieweeId, (ratingCount.get(r.revieweeId) ?? 0) + 1);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const users: User[] = userSeeds.map((seed) => {
  const count = ratingCount.get(seed.id) ?? 0;
  return {
    ...seed,
    karmaBalance: balanceOf(seed.id),
    hoursTaught: taught.get(seed.id) ?? 0,
    hoursLearned: learned.get(seed.id) ?? 0,
    rating: count ? round1((ratingSum.get(seed.id) ?? 0) / count) : 0,
    reviewCount: count
  };
});

const byId = new Map(users.map((u) => [u.id, u]));

export function getUser(id: string): User | undefined {
  return byId.get(id);
}

export const currentUser: User = byId.get(CURRENT_USER_ID)!;

/**
 * The PII-free projection every peer-facing screen reads.
 *
 * Audit P1-4: the Flutter app streamed the entire `users` collection — email
 * and phone number included — to every browser, starting before login. Peer
 * screens import `profiles`; only the admin app and /profile touch `users`.
 */
export function toPublicProfile(u: User): PublicProfile {
  const { email: _email, phoneNumber: _phone, notificationSettings: _notif, ...rest } = u;
  return rest;
}

export const profiles: PublicProfile[] = users.map(toPublicProfile);

export function getProfile(id: string): PublicProfile | undefined {
  return profiles.find((p) => p.id === id);
}

/** Peers = everyone but me, active only. Suspended accounts never appear in the student app. */
export const peers: PublicProfile[] = profiles.filter(
  (p) => p.id !== CURRENT_USER_ID && p.status === 'active'
);
