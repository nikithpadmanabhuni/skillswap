import { describe, it } from 'vitest';
import { users, profiles, peers, getProfile, getUser } from './store';
import { reviews } from './reviews';
import { settledSessions, sessions } from './sessions';
import { matches, mutualMatches } from './matches';
import { perks, redemptions } from './perks';
import { totals, karmaHealth, categoryDemand } from './analytics';
import { KARMA } from './constants';

describe('judge', () => {
  it('facts', () => {
    const active = users.filter(u => u.status === 'active');
    const distinctOffered = new Set(active.flatMap(u => u.skillsOffered.map(s => s.title)));
    console.log('active users', active.length);
    console.log('distinct offered titles (active)', distinctOffered.size);
    console.log('distinct offered titles (all)', new Set(users.flatMap(u=>u.skillsOffered.map(s=>s.title))).size);
    const wantListings = active.flatMap(u => u.skillsWanted.map(s => ({u, s})));
    console.log('want listings (active)', wantListings.length);
    console.log('want listings (all)', users.flatMap(u=>u.skillsWanted).length);
    // cross-category wants
    const crossCat = wantListings.filter(({u,s}) => !u.skillsOffered.some(o => o.category === s.category)).length;
    console.log('cross-category wants', crossCat, 'of', wantListings.length);
    // wants with exactly one teacher
    const offeredBy = new Map<string, string[]>();
    for (const u of active) for (const o of u.skillsOffered) {
      offeredBy.set(o.title, [...(offeredBy.get(o.title) ?? []), u.id]);
    }
    const one = wantListings.filter(({s}) => (offeredBy.get(s.title)?.length ?? 0) === 1).length;
    const zero = wantListings.filter(({s}) => (offeredBy.get(s.title)?.length ?? 0) === 0).length;
    console.log('wants with exactly 1 teacher', one, 'zero teachers', zero);
    console.log('25/25 offer >=1', active.filter(u=>u.skillsOffered.length>0).length, '/', active.length);
    const lvl: Record<string, number> = {};
    for (const u of active) for (const o of u.skillsOffered) lvl[o.level] = (lvl[o.level] ?? 0) + 1;
    console.log('offered levels (active)', JSON.stringify(lvl));

    // profiles used in concept
    for (const id of ['u-me','u-002','u-003','u-004','u-006','u-007','u-008','u-011','u-012','u-021','u-025']) {
      const p = getProfile(id)!;
      console.log(id, p.name, '| major', p.major, '| rating', p.rating, '| reviews', p.reviewCount, '| hoursTaught', p.hoursTaught, '| karma', p.karmaBalance);
    }
    // match aarav->priya
    console.log('match u-002', JSON.stringify(matches.find(m => m.targetUserId === 'u-002')));
    console.log('matches', matches.length, 'mutual', mutualMatches.length, 'peers', peers.length);
    // reviews cited
    for (const id of ['rev-s-001','rev-s-002','rev-s-005','rev-s-014','rev-s-h075','rev-s-h079','rev-s-h124']) {
      const r = reviews.find(x => x.id === id);
      console.log(id, r ? `${r.reviewerName} -> ${getProfile(r.revieweeId)?.name} | ${r.skillName} | ${r.rating} | "${r.comment}"` : 'MISSING');
    }
    console.log('reviews', reviews.length, 'mean', (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(4));
    console.log('>=4', reviews.filter(r=>r.rating>=4).length);
    console.log('settled', settledSessions.length, 'sessions', sessions.length);
    // statistics teachers
    console.log('Statistics teachers', active.filter(u=>u.skillsOffered.some(s=>s.title==='Statistics')).map(u=>u.name));
    const stat = settledSessions.filter(s => s.requestedSkillTitle === 'Statistics');
    console.log('Statistics settled sessions', stat.length, 'providers', [...new Set(stat.map(s=>s.providerId))], 'requesters', [...new Set(stat.map(s=>s.requesterId))]);
    console.log('perks', perks.map(p=>`${p.title}|${p.karmaCost}|${p.vendor}`));
    console.log('redemptions', redemptions.length, 'honoured', totals.redemptionsHonoured);
    console.log('karmaHealth', JSON.stringify(karmaHealth));
    console.log('KARMA', JSON.stringify(KARMA));
    console.log('categoryDemand', JSON.stringify(categoryDemand));
    // duplicate comment strings among chosen four
    const chosen = ['rev-s-014','rev-s-h075','rev-s-002','rev-s-005'].map(i=>reviews.find(r=>r.id===i));
    console.log('chosen comments', chosen.map(r=>r && `${r.reviewerName}->${getProfile(r.revieweeId)?.name}: ${r.comment}`));
    // Figma / other single-teacher checks
    for (const t of ['Figma','Baking','Piano','Running Coaching','Embedded C','Spanish','Knife Skills','Acoustic Guitar']) {
      console.log('teachers of', t, offeredBy.get(t)?.map(i=>getUser(i)!.name));
    }
  });
});
