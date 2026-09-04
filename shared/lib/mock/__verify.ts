import { users, profiles, getProfile, getUser } from './store';
import { reviews } from './reviews';
import { settledSessions, sessions } from './sessions';
import { matches, mutualMatches, peers } from './matches';
import { perks, redemptions } from './perks';
import { totals, karmaHealth, categoryDemand, topTeachers } from './analytics';
import { KARMA } from './constants';

const active = users.filter(u => u.status === 'active');
const offeredTitlesActive = new Set(active.flatMap(u => u.skillsOffered.map(s => s.title)));
const offeredTitlesAll = new Set(users.flatMap(u => u.skillsOffered.map(s => s.title)));
console.log('distinct offered titles active:', offeredTitlesActive.size, ' all:', offeredTitlesAll.size);
console.log('activeUsers', totals.activeUsers, 'users', totals.users);
console.log('all active offer >=1 skill:', active.filter(u => u.skillsOffered.length > 0).length, '/', active.length);
const levels: Record<string, number> = {};
active.forEach(u => u.skillsOffered.forEach(s => { levels[s.level] = (levels[s.level] || 0) + 1; }));
console.log('offered levels (active):', levels);
const wantLevels: Record<string, number> = {};
active.forEach(u => u.skillsWanted.forEach(s => { wantLevels[s.level] = (wantLevels[s.level] || 0) + 1; }));
console.log('wanted levels (active):', wantLevels);

// wants total among active
const wantEntries = active.flatMap(u => u.skillsWanted.map(s => ({ u, s })));
console.log('active want listings:', wantEntries.length);
// cross-category wants
const cross = wantEntries.filter(({u,s}) => !u.skillsOffered.some(o => o.category === s.category)).length;
console.log('wants outside own offered categories:', cross, '/', wantEntries.length);
// wants with exactly one teacher
const offeredBy = new Map<string,string[]>();
active.forEach(u => u.skillsOffered.forEach(s => {
  offeredBy.set(s.title, [...(offeredBy.get(s.title) || []), u.id]);
}));
const oneTeacher = wantEntries.filter(({s}) => (offeredBy.get(s.title)?.length ?? 0) === 1).length;
const zeroTeacher = wantEntries.filter(({s}) => (offeredBy.get(s.title)?.length ?? 0) === 0).length;
console.log('wants with exactly 1 teacher:', oneTeacher, ' zero teacher:', zeroTeacher);

// Statistics teachers
console.log('Statistics teachers active:', active.filter(u => u.skillsOffered.some(s => s.title === 'Statistics')).map(u => u.name));
const stat = settledSessions.filter(s => s.requestedSkillTitle === 'Statistics');
console.log('settled Statistics sessions:', stat.length, 'providers', [...new Set(stat.map(s => s.providerId))], 'requesters', [...new Set(stat.map(s => s.requesterId))]);

// hero
const m = matches.find(mm => mm.targetUserId === 'u-002');
console.log('match u-002:', m && { pct: (m as any).matchPercentage, mutual: (m as any).isMutual, keys: Object.keys(m) });
console.log('rev-s-001:', reviews.find(r => r.id === 'rev-s-001'));
console.log('rev-s-014:', reviews.find(r => r.id === 'rev-s-014'));
console.log('rev-s-002:', reviews.find(r => r.id === 'rev-s-002'));
console.log('rev-s-005:', reviews.find(r => r.id === 'rev-s-005'));
console.log('rev-s-h075:', reviews.find(r => r.id === 'rev-s-h075'));

// profiles used
for (const id of ['u-me','u-002','u-011','u-006','u-007','u-008','u-004','u-021','u-003','u-025','u-012']) {
  const p: any = getProfile(id);
  console.log(id, p && { name: p.name, major: p.major, rating: p.rating, reviewCount: p.reviewCount, karma: p.karmaBalance, hoursTaught: p.hoursTaught, hoursLearned: p.hoursLearned,
    offers: p.skillsOffered.map((s:any)=>s.title+':'+s.level), wants: p.skillsWanted.map((s:any)=>s.title) });
}
console.log('profile keys:', Object.keys(profiles[0] as any));
console.log('skill keys:', Object.keys((profiles[0] as any).skillsOffered[0]));

console.log('reviews:', reviews.length, 'mean', (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(3), '>=4:', reviews.filter(r=>r.rating>=4).length);
console.log('settledSessions', settledSessions.length, 'sessions', sessions.length);
console.log('peers', peers.length, 'matches', matches.length, 'mutual', mutualMatches.length);
console.log('perks:', perks.map(p => ({title:p.title, cost:p.karmaCost, vendor:(p as any).vendor})));
console.log('redemptions', redemptions.length, 'honoured', totals.redemptionsHonoured);
console.log('karmaHealth', karmaHealth);
console.log('categoryDemand', categoryDemand);
console.log('KARMA', KARMA);
console.log('review keys', Object.keys(reviews[0]));
