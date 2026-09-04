import { describe, expect, it } from 'vitest';
import { balanceOf, karmaLedger, ledgerIntegrity } from './karma';
import { redemptions } from './perks';
import { learnerOf, settledSessions, teacherOf } from './sessions';
import { KARMA } from './constants';
import { userSeeds } from './users';

/**
 * The one piece of logic worth testing at UI stage: it is the exact defect
 * (audit P1-1 / spec 4.9) that the rebuild exists to fix. If the mock economy
 * does not conserve Karma, every screen that renders a balance is lying.
 */
describe('karma ledger', () => {
  it('conserves supply: total === grants - redemptions', () => {
    const i = ledgerIntegrity();
    expect(i.expectedSupply).toBe(
      userSeeds.length * KARMA.JOINING_GRANT - redemptions.reduce((s, r) => s + r.karmaCost, 0)
    );
    expect(i.totalSupply).toBe(i.expectedSupply);
    expect(i.drift).toBe(0);
    expect(i.balanced).toBe(true);
  });

  it('pairs every teach credit with a learn debit', () => {
    const i = ledgerIntegrity();
    expect(i.teachCredits).toBe(i.learnDebits);
    expect(i.teachCredits).toBe(settledSessions.length * KARMA.PER_SESSION);
  });

  it('emits exactly two settlement rows per settled session, to different users', () => {
    for (const s of settledSessions) {
      const teach = karmaLedger.find((t) => t.id === `k-t-${s.id}`);
      const learn = karmaLedger.find((t) => t.id === `k-l-${s.id}`);
      expect(teach, `missing teach row for ${s.id}`).toBeDefined();
      expect(learn, `missing learn row for ${s.id}`).toBeDefined();
      expect(teach!.amount).toBe(-learn!.amount);
      expect(teach!.userId).toBe(teacherOf(s));
      expect(learn!.userId).toBe(learnerOf(s));
      expect(teach!.userId).not.toBe(learn!.userId);
    }
  });

  it('leaves no user with a negative balance', () => {
    for (const u of userSeeds) {
      expect(balanceOf(u.id), `${u.name} (${u.id}) is overdrawn`).toBeGreaterThanOrEqual(0);
    }
  });

  it('generates a back-history whose teach and learn slots are equal in number', () => {
    const taught = new Map<string, number>();
    const learned = new Map<string, number>();
    for (const s of settledSessions) {
      taught.set(teacherOf(s), (taught.get(teacherOf(s)) ?? 0) + 1);
      learned.set(learnerOf(s), (learned.get(learnerOf(s)) ?? 0) + 1);
    }
    const totalTaught = [...taught.values()].reduce((a, b) => a + b, 0);
    const totalLearned = [...learned.values()].reduce((a, b) => a + b, 0);
    expect(totalTaught).toBe(totalLearned);
    expect(totalTaught).toBe(settledSessions.length);
  });

  it('never has anyone teaching themselves', () => {
    for (const s of settledSessions) {
      expect(teacherOf(s), `self-session in ${s.id}`).not.toBe(learnerOf(s));
    }
  });

  it('is deterministic — repeated reads are identical', () => {
    expect(karmaLedger.map((t) => t.id)).toEqual(karmaLedger.map((t) => t.id));
    expect(balanceOf('u-me')).toBe(balanceOf('u-me'));
  });

  it('never redeems more than the redeeming user holds', () => {
    for (const r of redemptions) {
      expect(balanceOf(r.userId), `${r.userName} could not afford ${r.perkTitle}`).toBeGreaterThanOrEqual(0);
    }
  });
});
