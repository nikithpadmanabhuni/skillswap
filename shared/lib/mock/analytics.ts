import { karmaLedger, ledgerIntegrity } from './karma';
import { redemptions } from './perks';
import { sessions } from './sessions';
import { users } from './store';
import { openReports } from './reports';
import type { SessionStatus } from '../types';

/**
 * Admin dashboard aggregates. Every figure here is COMPUTED from the same
 * fixtures the student app reads — nothing is a standalone literal, so the two
 * apps cannot disagree about how many sessions or users exist.
 */

export const totals = {
  users: users.length,
  activeUsers: users.filter((u) => u.status === 'active').length,
  suspendedUsers: users.filter((u) => u.status === 'suspended').length,
  sessions: sessions.length,
  openReports: openReports.length,
  redemptionsIssued: redemptions.filter((r) => r.status === 'issued').length,
  redemptionsHonoured: redemptions.filter((r) => r.status === 'honoured').length
};

/** The session funnel: how far proposals actually get. */
export const sessionFunnel: Array<{ status: SessionStatus; count: number }> = (
  ['pending', 'accepted', 'scheduled', 'completed', 'reviewed', 'declined'] as SessionStatus[]
).map((status) => ({ status, count: sessions.filter((s) => s.status === status).length }));

export const karmaHealth = ledgerIntegrity();

/** Karma in circulation, by month, derived from the ledger. */
export const supplyByMonth = (() => {
  const months = new Map<string, number>();
  for (const t of karmaLedger) {
    const key = t.timestamp.slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + t.amount);
  }
  const keys = [...months.keys()].sort();
  let running = 0;
  return keys.map((month) => {
    running += months.get(month) ?? 0;
    return { month, net: months.get(month) ?? 0, supply: running };
  });
})();

/** Signups per month, from the seed join dates. */
export const signupsByMonth = (() => {
  const months = new Map<string, number>();
  for (const u of users) {
    const key = (u.joinedAt ?? '').slice(0, 7);
    if (key) months.set(key, (months.get(key) ?? 0) + 1);
  }
  return [...months.entries()].sort().map(([month, count]) => ({ month, count }));
})();

/** Which categories the campus is actually trading in. */
export const categoryDemand = (() => {
  const offered = new Map<string, number>();
  const wanted = new Map<string, number>();
  for (const u of users) {
    for (const s of u.skillsOffered) offered.set(s.category, (offered.get(s.category) ?? 0) + 1);
    for (const s of u.skillsWanted) wanted.set(s.category, (wanted.get(s.category) ?? 0) + 1);
  }
  const keys = new Set([...offered.keys(), ...wanted.keys()]);
  return [...keys]
    .map((category) => ({
      category,
      offered: offered.get(category) ?? 0,
      wanted: wanted.get(category) ?? 0
    }))
    .sort((a, b) => b.offered + b.wanted - (a.offered + a.wanted));
})();

export const topTeachers = [...users]
  .filter((u) => u.status === 'active')
  .sort((a, b) => b.hoursTaught - a.hoursTaught || a.name.localeCompare(b.name));

export const topKarma = [...users]
  .filter((u) => u.status === 'active')
  .sort((a, b) => b.karmaBalance - a.karmaBalance || a.name.localeCompare(b.name));
