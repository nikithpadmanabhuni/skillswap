import { describe, it } from 'vitest';
import { users, profiles, getProfile, peers } from './store';
import { reviews } from './reviews';
import { sessions, settledSessions, teacherOf, learnerOf } from './sessions';
import { karmaHealth, totals, topKarma, categoryDemand } from './analytics';
import { perks, redemptions } from './perks';
import { matches, mutualMatches } from './matches';
import { badgesFor } from './badges';
import { karmaLedger } from './karma';
import { CAMPUS } from './constants';

describe('judge2', () => {
  it('runs', () => {
    const active = users.filter(u => u.status === 'active');
    console.log('CAMPUS', CAMPUS);
    const campusCount: Record<string, number> = {};
    for (const u of users) campusCount[u.campus] = (campusCount[u.campus] ?? 0) + 1;
    console.log('campus split ALL', JSON.stringify(campusCount));
    const campusActive: Record<string, number> = {};
    for (const u of active) campusActive[u.campus] = (campusActive[u.campus] ?? 0) + 1;
    console.log('campus split ACTIVE', JSON.stringify(campusActive));
    console.log('victor campus', users.find(u=>u.status!=='active')?.campus, users.find(u=>u.status!=='active')?.name);

    const offers = active.flatMap(u => u.skillsOffered);
    const wants = active.flatMap(u => u.skillsWanted);
    console.log('ACTIVE offers', offers.length, 'wants', wants.length, 'distinct offered titles', new Set(offers.map(s=>s.title)).size);
    console.log('offer levels', JSON.stringify({e:offers.filter(s=>s.level==='expert').length,i:offers.filter(s=>s.level==='intermediate').length,b:offers.filter(s=>s.level==='beginner').length}));
    console.log('want levels', JSON.stringify({e:wants.filter(s=>s.level==='expert').length,i:wants.filter(s=>s.level==='intermediate').length,b:wants.filter(s=>s.level==='beginner').length}));
    console.log('distinct majors ACTIVE', new Set(active.map(u=>u.major)).size, 'of', active.length);
    console.log('distinct majors ALL', new Set(users.map(u=>u.major)).size, 'of', users.length);

    // active-only category demand
    const off = new Map<string,number>(), wan = new Map<string,number>();
    for (const u of active){ for(const s of u.skillsOffered) off.set(s.category,(off.get(s.category)??0)+1); for(const s of u.skillsWanted) wan.set(s.category,(wan.get(s.category)??0)+1); }
    const cats = [...new Set([...off.keys(),...wan.keys()])];
    console.log('ACTIVE categoryDemand', JSON.stringify(cats.map(c=>({c,o:off.get(c)??0,w:wan.get(c)??0})).sort((a,b)=>(b.o+b.w)-(a.o+a.w))));
    console.log('EXPORTED categoryDemand', JSON.stringify(categoryDemand));

    const offerersOf = new Map<string,string[]>(), wantersOf = new Map<string,string[]>();
    for (const u of active){ for(const s of u.skillsOffered) offerersOf.set(s.title,[...(offerersOf.get(s.title)??[]),u.name]); for(const s of u.skillsWanted) wantersOf.set(s.title,[...(wantersOf.get(s.title)??[]),u.name]); }
    const solo = [...offerersOf.entries()].filter(([t,o])=>o.length===1 && (wantersOf.get(t)?.length??0)>=1);
    console.log('SOLO teacher + >=1 waiting =', solo.length);
    console.log('guitar teachers', offerersOf.get('Acoustic Guitar'), 'waiting', wantersOf.get('Acoustic Guitar'));
    console.log('Baking', offerersOf.get('Baking'), wantersOf.get('Baking'), 'Knife', offerersOf.get('Knife Skills'), wantersOf.get('Knife Skills'));
    console.log('Japanese offered', offerersOf.get('Japanese'), 'wanted', wantersOf.get('Japanese'));
    console.log('unoffered wants', [...wantersOf.keys()].filter(t=>!offerersOf.has(t)).map(t=>`${t}(${wantersOf.get(t)!.length})`));

    // cross discipline sessions
    let cross = 0;
    for (const s of settledSessions) { const l = users.find(u=>u.id===learnerOf(s)); const cats = new Set(l?.skillsOffered.map(k=>k.category)); const sk = users.find(u=>u.id===teacherOf(s))?.skillsOffered.find(k=>k.title===s.requestedSkillTitle); if (sk && !cats.has(sk.category)) cross++; }
    console.log('cross-discipline', cross, 'of', settledSessions.length);

    console.log('reviews', reviews.length, 'mean', (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(4));
    const dist: Record<string,number> = {}; for(const r of reviews) dist[r.rating]=(dist[r.rating]??0)+1;
    console.log('dist', JSON.stringify(dist), 'ge4.5', reviews.filter(r=>r.rating>=4.5).length);
    for (const id of ['rev-s-001','rev-s-014','rev-s-005']) { const r = reviews.find(x=>x.id===id)!; console.log(id, JSON.stringify({reviewer:r.reviewerName, reviewerStatus: getProfile(r.reviewerId)?.status, reviewee:getProfile(r.revieweeId)?.name, revieweeStatus:getProfile(r.revieweeId)?.status, skill:r.skillName, rating:r.rating, comment:r.comment})); }

    const bcount: Record<string,number> = {};
    for (const u of active) for (const b of badgesFor(u)) if (b.isUnlocked) bcount[b.title]=(bcount[b.title]??0)+1;
    console.log('badges', JSON.stringify(bcount));

    const bals = active.map(u=>u.karmaBalance);
    console.log('karma max', Math.max(...bals), 'min', Math.min(...bals), 'mean', (bals.reduce((a,b)=>a+b,0)/bals.length).toFixed(3), 'ge150', bals.filter(b=>b>=150).length, 'eq150', bals.filter(b=>b===150).length);
    console.log('karmaHealth', JSON.stringify(karmaHealth));
    console.log('totals', JSON.stringify(totals));
    console.log('redemptions', JSON.stringify(redemptions.map(r=>({id:r.id,status:r.status}))));
    console.log('perks', JSON.stringify(perks.map(p=>[p.title,p.karmaCost])));
    console.log('ledger reasons', JSON.stringify([...new Set(karmaLedger.map(t=>t.type ?? (t as any).reason))]));
    console.log('peers', peers.length, 'matches', matches.length, 'mutual', mutualMatches.length);
    const mIds = new Set(matches.map(m=>m.peerId ?? (m as any).userId));
    console.log('sample match', JSON.stringify(matches[0]));
    const priyaMatch = matches.find(m=>JSON.stringify(m).includes('u-002')); console.log('Aarav-Priya match', JSON.stringify(priyaMatch));
    const meiMatch = matches.find(m=>JSON.stringify(m).includes('u-004')); console.log('Aarav-MeiLing match', JSON.stringify(meiMatch));
  });
});
