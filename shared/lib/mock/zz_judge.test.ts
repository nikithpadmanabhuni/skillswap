import { test } from 'vitest';
import { users, profiles, peers, getProfile, currentUser } from './store';
import { reviews } from './reviews';
import { sessions, settledSessions, teacherOf, learnerOf } from './sessions';
import { karmaHealth, totals, topKarma, sessionFunnel, categoryDemand } from './analytics';
import { perks, redemptions } from './perks';
import { matches, mutualMatches } from './matches';
import { meshes } from './mesh';
import { KARMA } from './constants';

const P = (...a: unknown[]) => console.log(...a);

test('judge', () => {
  const active = users.filter((u) => u.status === 'active');
  P('ACTIVE COUNT', active.length, 'peers', peers.length, 'matches', matches.length, 'mutual', mutualMatches.length);

  // 1. all taught and learned
  const bothCols = active.filter((u) => u.hoursTaught > 0 && u.hoursLearned > 0);
  P('ACTIVE with taught>0 AND learned>0:', bothCols.length, 'of', active.length);
  P('  zero-taught:', active.filter(u=>u.hoursTaught===0).map(u=>u.name));
  P('  zero-learned:', active.filter(u=>u.hoursLearned===0).map(u=>u.name));
  P('ACTIVE with >=1 offered and >=1 wanted:', active.filter(u=>u.skillsOffered.length&&u.skillsWanted.length).length);

  // 2. levels
  const offers = active.flatMap(u=>u.skillsOffered);
  const wants  = active.flatMap(u=>u.skillsWanted);
  const lev = (arr:any[]) => arr.reduce((m,s)=>{m[s.level]=(m[s.level]??0)+1;return m;},{} as any);
  P('OFFERS total', offers.length, lev(offers));
  P('WANTS total', wants.length, lev(wants));
  P('ALL(26) offers', users.flatMap(u=>u.skillsOffered).length, lev(users.flatMap(u=>u.skillsOffered)));
  P('DISTINCT offered titles (active)', new Set(offers.map(s=>s.title)).size, '(all)', new Set(users.flatMap(u=>u.skillsOffered).map(s=>s.title)).size);

  // same title offered AND wanted by same person?
  P('people offering a title they also want:', active.filter(u=>u.skillsOffered.some(o=>u.skillsWanted.some(w=>w.title===o.title))).map(u=>u.name));

  // 3. named students
  for (const id of ['u-002','u-017','u-025','u-004','u-me']) {
    const p:any = getProfile(id);
    P('PROFILE', id, p.name, '|', p.major, '|', p.campus, '| bio:', JSON.stringify(p.bio));
    P('   offers', p.skillsOffered.map((s:any)=>`${s.title}(${s.level},${s.category})`).join(', '));
    P('   wants ', p.skillsWanted.map((s:any)=>`${s.title}(${s.level},${s.category})`).join(', '));
    P('   taught', p.hoursTaught, 'learned', p.hoursLearned, 'rating', p.rating, 'reviews', p.reviewCount, 'karma', p.karmaBalance, 'avatarUrl', JSON.stringify(p.avatarUrl));
  }
  P('active with exactly 1 offered skill:', active.filter(u=>u.skillsOffered.length===1).map(u=>u.name));
  const jamieLearned = settledSessions.filter(s=>learnerOf(s)==='u-025');
  P('Jamie learned sessions:', jamieLearned.map(s=>`${s.id}:${s.requestedSkillTitle}`));
  const jamieTaught = settledSessions.filter(s=>teacherOf(s)==='u-025');
  P('Jamie taught sessions:', jamieTaught.map(s=>`${s.id}:${s.requestedSkillTitle}->${learnerOf(s)}`));

  // 4. karma
  P('karmaHealth', karmaHealth);
  P('topKarma[0]', topKarma[0].name, topKarma[0].karmaBalance);
  P('totals', totals, 'redemptions', redemptions.length, redemptions.map(r=>r.status));
  P('perks', perks.map(p=>`${p.title}:${p.karmaCost}`));
  P('KARMA', KARMA);

  // 5. sessions/reviews
  P('sessions', sessions.length, 'settled', settledSessions.length, 'funnel', sessionFunnel);
  const dist = reviews.reduce((m,r)=>{m[r.rating]=(m[r.rating]??0)+1;return m;},{} as any);
  P('rating dist', dist, 'mean', (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(4));
  P('>=4', reviews.filter(r=>r.rating>=4).length, '>=4.5', reviews.filter(r=>r.rating>=4.5).length);
  P('sub-4 reviews', reviews.filter(r=>r.rating<4).map(r=>`${r.id} about ${r.revieweeId}(${users.find(u=>u.id===r.revieweeId)!.status}) by ${r.reviewerName} rating ${r.rating}`));
  for (const id of ['rev-s-001','rev-s-003','rev-s-014','rev-s-h075','rev-s-h079','rev-s-002','rev-s-h221']) {
    const r = reviews.find(x=>x.id===id);
    P('REVIEW', id, r ? `${r.reviewerName} -> ${users.find(u=>u.id===r.revieweeId)!.name} | ${r.skillName} | ${r.rating} | "${r.comment}" | date ${r.createdAt}` : 'MISSING');
  }
  P('distinct comment strings used', new Set(reviews.map(r=>r.comment)).size);

  // 6. sole-teacher predicate
  const offerersOf = new Map<string,string[]>(); const wantersOf = new Map<string,string[]>();
  for (const u of active) {
    for (const s of u.skillsOffered) offerersOf.set(s.title, [...(offerersOf.get(s.title)??[]), u.name]);
    for (const s of u.skillsWanted) wantersOf.set(s.title, [...(wantersOf.get(s.title)??[]), u.name]);
  }
  const sole = [...wantersOf.entries()].filter(([t,w])=>w.length>=2 && (offerersOf.get(t)?.length??0)===1)
    .map(([title,w])=>({title, waiting:w.length, teacher:offerersOf.get(title)![0]}))
    .sort((a,b)=>b.waiting-a.waiting||a.title.localeCompare(b.title));
  P('SOLE TEACHER COUNT', sole.length);
  sole.forEach(s=>P('   ', s.title, s.waiting, 'waiting ->', s.teacher));
  const unoffered = [...wantersOf.keys()].filter(t=>!offerersOf.has(t));
  P('WANTED WITH ZERO ACTIVE OFFERERS', unoffered, 'wanted by', unoffered.map(t=>wantersOf.get(t)));
  const allOffersAll = users.flatMap(u=>u.skillsOffered);
  P('  of those, offered by a SUSPENDED user?', unoffered.map(t=>allOffersAll.some(s=>s.title===t)));
  P('category lookup works for all sole titles?', sole.every(s=>active.flatMap(u=>u.skillsOffered).some(o=>o.title===s.title)));
  // campus of sole teachers
  P('sole teachers campus', sole.map(s=>{const u=active.find(a=>a.name===s.teacher)!; return `${s.teacher}:${u.campus}`;}));

  // cross-discipline want
  const outside = active.filter(u=>{
    const own = new Set(u.skillsOffered.map(s=>s.category));
    return u.skillsWanted.some(w=>!own.has(w.category));
  });
  P('active wanting outside own offered category:', outside.length, 'of', active.length);
  const crossSessions = settledSessions.filter(s=>{
    const l = users.find(u=>u.id===learnerOf(s))!;
    const own = new Set(l.skillsOffered.map(k=>k.category));
    const sk = allOffersAll.find(k=>k.title===s.requestedSkillTitle);
    return sk ? !own.has(sk.category) : false;
  });
  P('cross-discipline settled sessions', crossSessions.length, 'of', settledSessions.length);

  // mesh legs
  const m = meshes[0];
  P('mesh m-001', m.status, m.referenceId, m.skillAtoB.title, m.skillBtoC.title, m.skillCtoA.title);
  for (const sid of ['s-021','s-022','s-023']) { const s = sessions.find(x=>x.id===sid); P('  ', sid, s?.status, s?.requestedSkillTitle, teacherOf(s!), '->', learnerOf(s!)); }
  P('categoryDemand', categoryDemand);
  P('campus split', users.reduce((m:any,u)=>{m[u.campus]=(m[u.campus]??0)+1;return m;},{}));
  P('Acoustic Guitar wanters', wantersOf.get('Acoustic Guitar'), 'offerers', offerersOf.get('Acoustic Guitar'));
  P('Figma wanters', wantersOf.get('Figma'), 'offerers', offerersOf.get('Figma'));
  P('Knife Skills wanters', wantersOf.get('Knife Skills'), 'offerers', offerersOf.get('Knife Skills'));
});
