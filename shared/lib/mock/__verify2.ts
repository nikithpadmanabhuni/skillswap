import { users, getProfile, getUser, peers } from './store';
import { reviews } from './reviews';
import { perks, redemptions } from './perks';
import { matches, mutualMatches } from './matches';
import { totals, karmaHealth } from './analytics';
const active = users.filter(u => u.status === 'active');
console.log('peers', peers.length, 'matches', matches.length, 'mutual', mutualMatches.length);
console.log('min hoursTaught among active:', Math.min(...active.map(u=>u.hoursTaught)), 'zero-hour teachers:', active.filter(u=>u.hoursTaught===0).map(u=>u.name));
const low = reviews.filter(r => r.rating < 4);
console.log('sub-4 reviews:', low.map(r => ({id:r.id, reviewer:r.reviewerName, reviewee:getUser(r.revieweeId)?.name, status:getUser(r.revieweeId)?.status, rating:r.rating, skill:r.skillName})));
console.log('perks:', perks.map(p=>({title:p.title, cost:p.karmaCost, vendor:(p as any).vendor, keys:Object.keys(p)})));
console.log('redemptions:', redemptions.map(r=>({status:(r as any).status})), 'honoured', totals.redemptionsHonoured);
console.log('supply', karmaHealth.totalSupply);
// wanted skill isOffering
const w = getProfile('u-me')!.skillsWanted[0]; console.log('wanted skill sample', w);
// marcus karma composition
const marcus = getUser('u-011')!; console.log('marcus', {karma:marcus.karmaBalance, taught:marcus.hoursTaught, learned:marcus.hoursLearned});
