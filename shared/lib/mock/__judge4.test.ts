import { describe,it } from 'vitest';
import { users } from './store';
describe('j4',()=>{it('d',()=>{
 const active=users.filter(u=>u.status==='active');
 const c:Record<string,number>={}; for(const u of active) c[u.campus]=(c[u.campus]||0)+1;
 console.log('active campus split',c);
 const all:Record<string,number>={}; for(const u of users) all[u.campus]=(all[u.campus]||0)+1;
 console.log('all campus split',all);
 console.log('riverside actives',active.filter(u=>u.campus!=='Northgate University').map(u=>`${u.name}/${u.major}`));
});});
