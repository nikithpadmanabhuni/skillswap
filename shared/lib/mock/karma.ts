import type { KarmaTransaction } from '../types';
import { KARMA } from './constants';
import { redemptions } from './perks';
import { learnerOf, settledSessions, teacherOf } from './sessions';
import { userSeeds } from './users';

/**
 * The Karma ledger — append-only, and the ONLY source of a balance.
 *
 * This is the defect the whole rebuild exists to fix. The Flutter app debited
 * the learner in the database and credited the teacher in local memory only,
 * destroying 10 Karma on every completed session (audit P1-1). Here the ledger
 * is BUILT from events rather than hand-written, so a teach credit cannot exist
 * without its matching learn debit: they are emitted by the same loop.
 *
 * Conservation invariant, asserted by shared/lib/mock/karma.test.ts:
 *     total supply === sum(joining grants) - sum(redemptions)
 */

const rows: KarmaTransaction[] = [];

function push(
  id: string,
  userId: string,
  title: string,
  amount: number,
  reason: KarmaTransaction['reason'],
  timestamp: string,
  peerName: string
) {
  rows.push({ id, userId, title, amount, reason, timestamp, peerName });
}

/* 1. Joining grants — the only Karma source. */
for (const u of userSeeds) {
  push(`k-grant-${u.id}`, u.id, 'Welcome to SkillSwap', KARMA.JOINING_GRANT, 'joining_grant', u.joinedAt, 'SkillSwap Campus');
}

/* 2. Session settlement — emitted in pairs, so it can never leak.
      Karma settles on completed -> reviewed (spec 2.3), which is why this
      iterates settledSessions rather than every session. */
for (const s of settledSessions) {
  const teacherId = teacherOf(s);
  const learnerId = learnerOf(s);
  const at = s.scheduledDateTime ?? s.id;

  push(`k-t-${s.id}`, teacherId, `Taught ${s.requestedSkillTitle}`, s.karmaAmount, 'teach', at, s.studentName);
  push(`k-l-${s.id}`, learnerId, `Learned ${s.requestedSkillTitle}`, -s.karmaAmount, 'learn', at, s.teacherName);
}

/* 3. Perk redemption — the only Karma sink. */
for (const r of redemptions) {
  push(`k-r-${r.id}`, r.userId, `Redeemed: ${r.perkTitle}`, -r.karmaCost, 'redemption', r.createdAt, r.perkTitle);
}

/** Newest first. Deterministic: string compare on fixed ISO timestamps, never Date.now(). */
export const karmaLedger: KarmaTransaction[] = rows.sort((a, b) =>
  a.timestamp === b.timestamp ? a.id.localeCompare(b.id) : b.timestamp.localeCompare(a.timestamp)
);

/** Balance is DERIVED, never stored. Spec 4.1: "balance is a derived, server-maintained value". */
export function balanceOf(userId: string): number {
  return karmaLedger.reduce((sum, t) => (t.userId === userId ? sum + t.amount : sum), 0);
}

export function ledgerFor(userId: string): KarmaTransaction[] {
  return karmaLedger.filter((t) => t.userId === userId);
}

/* ------------------------------------------------------------------ integrity */

export interface LedgerIntegrity {
  totalSupply: number;
  grantedTotal: number;
  redeemedTotal: number;
  /** grants - redemptions; what totalSupply must equal */
  expectedSupply: number;
  drift: number;
  balanced: boolean;
  teachCredits: number;
  learnDebits: number;
  transactionCount: number;
}

/** Powers the admin /karma drift monitor (spec 4.5 observability, 4.9). */
export function ledgerIntegrity(): LedgerIntegrity {
  let totalSupply = 0;
  let grantedTotal = 0;
  let redeemedTotal = 0;
  let teachCredits = 0;
  let learnDebits = 0;

  for (const t of karmaLedger) {
    totalSupply += t.amount;
    if (t.reason === 'joining_grant') grantedTotal += t.amount;
    if (t.reason === 'redemption') redeemedTotal += -t.amount;
    if (t.reason === 'teach') teachCredits += t.amount;
    if (t.reason === 'learn') learnDebits += -t.amount;
  }

  const expectedSupply = grantedTotal - redeemedTotal;
  return {
    totalSupply,
    grantedTotal,
    redeemedTotal,
    expectedSupply,
    drift: totalSupply - expectedSupply,
    balanced: totalSupply === expectedSupply && teachCredits === learnDebits,
    teachCredits,
    learnDebits,
    transactionCount: karmaLedger.length
  };
}
