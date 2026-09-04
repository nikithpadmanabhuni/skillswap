import { test } from 'vitest';
import {
  users, profiles, peers, getProfile, getUser, karmaHealth, totals, KARMA,
  reviews, settledSessions, sessions, meshes, matches, mutualMatches,
  perks, redemptions, topKarma, topTeachers, categoryDemand, badgesFor, BADGE_THRESHOLDS, CAMPUS
} from './index';

test('audit', () => {
  const active = users.filter((u) => u.status === 'active');
  const out: Record<string, unknown> = {};
  out.karmaHealth = karmaHealth;
  out.totals = totals;
  out.peers = peers.length;
  out.matches = matches.length;
  out.mutual = mutualMatches.length;
  out.categoryDemandExported = categoryDemand;

  // active-only category demand
  const cd: Record<string, {offered:number;wanted:number}> = {};
  let offers = 0, wants = 0;
  const offeredTitles = new Set<string>();
  const levels: Record<string, number> = {};
  const wantLevels: Record<string, number> = {};
  for (const u of active) {
    for (const s of u.skills) {
      const c = s.category as string;
      cd[c] ??= { offered: 0, wanted: 0 };
      if (s.isOffering) { cd[c].offered++; offers++; offeredTitles.add(s.title); levels[s.level] = (levels[s.level]??0)+1; }
      else { cd[c].wanted++; wants++; wantLevels[s.level] = (wantLevels[s.level]??0)+1; }
    }
  }
  out.activeCategoryDemand = cd;
  out.offers = offers; out.wants = wants;
  out.distinctOfferedTitles = offeredTitles.size;
  out.offerLevels = levels; out.wantLevels = wantLevels;
  out.distinctMajors = new Set(active.map(u=>u.major)).size;

  // solo teacher skills with >=1 waiting
  const teachers: Record<string, string[]> = {};
  const waiting: Record<string, string[]> = {};
  for (const u of active) for (const s of u.skills) {
    (s.isOffering ? teachers : waiting)[s.title] ??= [];
    (s.isOffering ? teachers : waiting)[s.title].push(u.name);
  }
  const solo = Object.keys(teachers).filter(t => teachers[t].length === 1 && (waiting[t]?.length ?? 0) >= 1);
  out.soloTeacherWithDemand = solo.length;
  out.guitar = { teachers: teachers['Acoustic Guitar'], waiting: waiting['Acoustic Guitar']?.length };
  out.baking = { teachers: teachers['Baking'], waiting: waiting['Baking']?.length };
  out.knife = { teachers: teachers['Knife Skills'], waiting: waiting['Knife Skills']?.length };
  out.japanese = { teachers: teachers['Japanese'] ?? null, waiting: waiting['Japanese']?.length };

  // reviews
  const mean = reviews.reduce((a,r)=>a+r.rating,0)/reviews.length;
  out.reviewCount = reviews.length;
  out.mean = mean;
  out.dist = reviews.reduce((a:Record<string,number>,r)=>{a[String(r.rating)]=(a[String(r.rating)]??0)+1;return a;},{});
  out.gte45 = reviews.filter(r=>r.rating>=4.5).length;
  for (const id of ['rev-s-001','rev-s-014','rev-s-005']) {
    const r = reviews.find(x=>x.id===id)!;
    out[id] = r ? { comment: r.comment, rating: r.rating, skill: (r as any).skillName, reviewer: getUser(r.reviewerId)?.name, reviewerStatus: getUser(r.reviewerId)?.status, reviewee: getUser(r.revieweeId)?.name, reviewerAvatar: JSON.stringify((getUser(r.reviewerId) as any)?.avatarUrl), keys: Object.keys(r) } : 'MISSING';
  }

  // badges
  const counts: Record<string, number> = {};
  for (const u of active) for (const b of badgesFor(u.id)) if ((b as any).unlocked ?? true) counts[(b as any).title ?? (b as any).id] = (counts[(b as any).title ?? (b as any).id]??0)+1;
  out.badgeSample = badgesFor('u-me');
  out.badgeCounts = counts;
  out.thresholds = BADGE_THRESHOLDS;

  // karma balances
  out.maxBalance = Math.max(...active.map(u=>u.karmaBalance));
  out.meanBalance = active.reduce((a,u)=>a+u.karmaBalance,0)/active.length;

  // cross-discipline
  let cross = 0;
  for (const s of settledSessions) {
    const learnerId = (s as any).requesterId === (s as any).teacherId ? null : null;
    void learnerId;
  }
  out.settled = settledSessions.length;
  out.sessions = sessions.length;
  out.perks = perks.map(p=>({t:p.title,c:p.karmaCost}));
  out.redemptions = redemptions.map(r=>r.status);
  out.mesh0 = { id: meshes[0].id, status: meshes[0].status, ref: (meshes[0] as any).referenceId, keys: Object.keys(meshes[0]) };
  out.profiles = { u004: getProfile('u-004')?.name, u002: getProfile('u-002')?.name, ume: getProfile('u-me')?.name };
  out.topKarma0 = topKarma[0]?.karmaBalance;
  out.topTeachers0 = topTeachers[0]?.name;
  out.campus = CAMPUS;
  out.hoursTaughtSum = users.reduce((a,u)=>a+u.hoursTaught,0);
  console.log(JSON.stringify(out, null, 1));
});
