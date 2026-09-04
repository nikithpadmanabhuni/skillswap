import { describe, it } from 'vitest';
import { users } from './store';
describe('j3', () => { it('r', () => {
  const active = users.filter(u=>u.status==='active');
  const cats = ['academics','tech','arts','fitness','music','languages','cooking'];
  for (const c of cats) {
    const teachers = new Set(active.filter(u=>u.skillsOffered.some(s=>s.category===c)).map(u=>u.id));
    const learners = new Set(active.filter(u=>u.skillsWanted.some(s=>s.category===c)).map(u=>u.id));
    const oL = active.flatMap(u=>u.skillsOffered).filter(s=>s.category===c).length;
    const wL = active.flatMap(u=>u.skillsWanted).filter(s=>s.category===c).length;
    console.log(`${c}: offerListings=${oL} distinctTeachers=${teachers.size} | wantListings=${wL} distinctLearners=${learners.size}`);
  }
});});
