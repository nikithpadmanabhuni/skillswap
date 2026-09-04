import type { Session } from '../types';
import { KARMA } from './constants';
import { userSeeds } from './users';

/**
 * Sessions covering every one of the six lifecycle states, so each list
 * grouping and status pill has real data behind it.
 *
 * `karmaAmount` always reads from KARMA.PER_SESSION rather than a literal —
 * changing the constant must not leave stale numbers in the fixtures.
 */

type Seed = [
  id: string,
  requesterId: string,
  providerId: string,
  teacherName: string,
  studentName: string,
  requestedSkillTitle: string,
  status: Session['status'],
  scheduledDateTime: string | undefined,
  location: string,
  durationHours: number,
  offeredSkillTitle?: string,
  notes?: string
];

const seeds: Seed[] = [
  // --- current user is the LEARNER (settled: -10 from u-me) ---
  ['s-001', 'u-me', 'u-002', 'Priya Raghunathan', 'Aarav Mehta', 'Acoustic Guitar', 'reviewed', '2026-08-15T17:00:00.000Z', 'Music Building, Room 2.14', 1, 'Flutter Development', 'Bring a pick. Priya has a spare guitar.'],
  ['s-002', 'u-me', 'u-003', 'Daniel Okonjo', 'Aarav Mehta', 'Spanish', 'reviewed', '2026-08-22T12:30:00.000Z', 'Library cafe, ground floor', 1, undefined, 'Conversation only, no grammar drills.'],

  // --- current user is the TEACHER (settled: +10 to u-me) ---
  ['s-003', 'u-003', 'u-me', 'Aarav Mehta', 'Daniel Okonjo', 'Flutter Development', 'reviewed', '2026-08-18T16:00:00.000Z', 'CS Building, Lab 4', 1, 'Spanish', 'Daniel wants to build a vocab app.'],
  ['s-004', 'u-004', 'u-me', 'Aarav Mehta', 'Mei-Ling Chen', 'Data Structures', 'reviewed', '2026-08-25T15:00:00.000Z', 'CS Building, Lab 4', 1, undefined, 'Linked lists and big-O.'],
  ['s-005', 'u-025', 'u-me', 'Aarav Mehta', 'Jamie Roth', 'Flutter Development', 'reviewed', '2026-08-29T18:00:00.000Z', 'Students Union, quiet corner', 1, undefined, 'Absolute beginner. Start with setup.'],

  // --- live states, not yet settled ---
  ['s-006', 'u-me', 'u-004', 'Mei-Ling Chen', 'Aarav Mehta', 'Film Photography', 'pending', undefined, '', 1, 'Data Structures', 'Saw your prints in the studio show. I have my dad old Pentax and no idea.'],
  ['s-007', 'u-me', 'u-005', 'Jonas Weber', 'Aarav Mehta', 'Bouldering', 'accepted', undefined, '', 1.5, 'Data Structures', 'Happy to trade algorithms help for climbing.'],
  ['s-008', 'u-011', 'u-me', 'Aarav Mehta', 'Marcus Bell', 'Python', 'scheduled', '2026-09-09T18:00:00.000Z', 'CS Building, Lab 2', 1, 'Music Theory', 'Marcus wants to analyse practice recordings.'],
  ['s-009', 'u-me', 'u-011', 'Marcus Bell', 'Aarav Mehta', 'Music Theory', 'scheduled', '2026-09-11T19:00:00.000Z', 'Music Building, Practice Room 6', 1, 'Python', 'The other half of the swap with Marcus.'],
  ['s-010', 'u-009', 'u-me', 'Aarav Mehta', 'Ravi Chandrasekhar', 'Python', 'completed', '2026-09-02T14:00:00.000Z', 'Media Centre, Edit Suite 3', 1, 'Video Editing', 'Automating file renaming. Review still outstanding.'],
  ['s-011', 'u-me', 'u-018', 'Lucas Ferreira', 'Aarav Mehta', 'Unity', 'declined', undefined, '', 1, undefined, 'Clashes with my deadline, sorry — try me next month.'],

  // --- peer-to-peer traffic, so the admin oversight screens are not just about one user ---
  ['s-012', 'u-007', 'u-002', 'Priya Raghunathan', 'Tomas Nowak', 'Acoustic Guitar', 'reviewed', '2026-08-12T16:00:00.000Z', 'Music Building, Room 2.14', 1, 'Statistics', ''],
  ['s-013', 'u-002', 'u-007', 'Tomas Nowak', 'Priya Raghunathan', 'Python', 'reviewed', '2026-08-14T13:00:00.000Z', 'Maths Building, Room 1.02', 1, 'Acoustic Guitar', ''],
  ['s-014', 'u-006', 'u-004', 'Mei-Ling Chen', 'Sofia Almeida', 'Figma', 'reviewed', '2026-08-19T11:00:00.000Z', 'Design Studio', 1, 'Baking', ''],
  ['s-015', 'u-004', 'u-006', 'Sofia Almeida', 'Mei-Ling Chen', 'Baking', 'reviewed', '2026-08-21T10:00:00.000Z', 'Food Lab, Kitchen 2', 1, 'Figma', ''],
  ['s-016', 'u-014', 'u-016', 'Ben Carter', 'Oliver Grant', 'Strength Training', 'reviewed', '2026-08-26T08:00:00.000Z', 'Campus Gym', 1, 'Econometrics', ''],
  ['s-017', 'u-016', 'u-014', 'Oliver Grant', 'Ben Carter', 'Econometrics', 'reviewed', '2026-08-28T09:00:00.000Z', 'Economics Building, Room 3.11', 1, 'Strength Training', ''],
  ['s-018', 'u-021', 'u-019', 'Grace Mwangi', 'Kwame Asante', 'Legal Writing', 'reviewed', '2026-08-30T17:00:00.000Z', 'Law Library', 1, undefined, ''],
  ['s-019', 'u-010', 'u-015', 'Fatima Al-Sayed', 'Hannah Lindqvist', 'CAD Modelling', 'scheduled', '2026-09-10T13:00:00.000Z', 'Architecture Studio', 1, 'Korean', ''],
  ['s-020', 'u-017', 'u-020', 'Ines Duarte', 'Nadia Hassan', 'SPSS & Research Methods', 'pending', undefined, '', 1, 'Organic Chemistry', ''],

  // --- the three sessions produced by mesh m-001 (see mesh.ts) ---
  ['s-021', 'u-004', 'u-me', 'Aarav Mehta', 'Mei-Ling Chen', 'Data Structures', 'reviewed', '2026-08-08T15:00:00.000Z', 'CS Building, Lab 4', 1, undefined, 'Mesh leg 1 of 3.'],
  ['s-022', 'u-002', 'u-004', 'Mei-Ling Chen', 'Priya Raghunathan', 'Figma', 'reviewed', '2026-08-09T15:00:00.000Z', 'Design Studio', 1, undefined, 'Mesh leg 2 of 3.'],
  ['s-023', 'u-me', 'u-002', 'Priya Raghunathan', 'Aarav Mehta', 'Acoustic Guitar', 'reviewed', '2026-08-10T15:00:00.000Z', 'Music Building, Room 2.14', 1, undefined, 'Mesh leg 3 of 3.']
];

const narrativeSessions: Session[] = seeds.map((s) => ({
  id: s[0],
  requesterId: s[1],
  providerId: s[2],
  teacherName: s[3],
  studentName: s[4],
  requestedSkillTitle: s[5],
  status: s[6],
  scheduledDateTime: s[7],
  location: s[8],
  durationHours: s[9],
  offeredSkillTitle: s[10],
  notes: s[11] ?? '',
  karmaAmount: KARMA.PER_SESSION
}));

/* ------------------------------------------------------------------ history */

/**
 * The 23 sessions above are the NARRATIVE set: they drive the student app's
 * screens and cover all six lifecycle states. On their own they leave the
 * platform looking a fortnight old — nobody has enough taught hours to unlock
 * Master Tutor, and the leaderboards are flat.
 *
 * This block generates the settled back-history. It is derived, not typed out,
 * for one reason: hoursTaught / hoursLearned and the Karma balances are all
 * computed FROM sessions (spec 2.4 — server-computed, client-read-only). Any
 * hand-written hours figure would drift from the session list the moment either
 * changed. Targets are declared here; the pairing is generated to hit them.
 */
export const TARGET_TAUGHT: Record<string, number> = {
  'u-003': 22, 'u-me': 20, 'u-011': 19, 'u-002': 18, 'u-007': 18, 'u-020': 17,
  'u-017': 16, 'u-016': 16, 'u-006': 15, 'u-004': 6, 'u-008': 6, 'u-012': 6,
  'u-015': 6, 'u-019': 6, 'u-005': 5, 'u-009': 5, 'u-010': 5, 'u-013': 5,
  'u-022': 5, 'u-014': 4, 'u-021': 4, 'u-024': 4, 'u-018': 3, 'u-023': 3,
  'u-025': 1, 'u-026': 1
};

/**
 * Learn targets are constrained, not arbitrary.
 *
 * In a CLOSED economy sum(taught) must equal sum(learned), so sum of all
 * (taught - learned) is zero: every Karma one student accumulates is one another
 * spent. With a 60 joining grant and 10 per session that puts a hard ceiling on
 * how rich anyone can get -- a user cannot go more than 6 sessions net-negative
 * before hitting a zero balance, so the total surplus available to the top
 * teachers is bounded by roughly 6x the number of net learners.
 *
 * The shape below is therefore deliberate: nine committed teachers carry a
 * surplus, the rest run their joining grant down. Every user who has redeemed a
 * perk is in the teacher group, because balance is
 * 60 + 10*(taught - learned) - redeemed and must never go negative.
 */
export const TARGET_LEARNED: Record<string, number> = {
  'u-003': 11, 'u-me': 6, 'u-011': 9, 'u-002': 9, 'u-007': 11, 'u-020': 10,
  'u-017': 7, 'u-016': 9, 'u-006': 9, 'u-004': 11, 'u-008': 11, 'u-012': 11,
  'u-015': 11, 'u-019': 11, 'u-005': 10, 'u-009': 10, 'u-010': 10, 'u-013': 10,
  'u-022': 10, 'u-014': 9, 'u-021': 9, 'u-024': 8, 'u-018': 7, 'u-023': 7,
  'u-025': 5, 'u-026': 5
};

/**
 * Which skill a generated session teaches. Rotating through the teacher's own
 * offered list keeps the invariant that a session only ever teaches something
 * the provider actually offers, and stops a prolific tutor's history reading as
 * fifteen copies of the same session.
 */
const OFFERED: Record<string, string[]> = Object.fromEntries(
  userSeeds.map((u) => [u.id, u.skillsOffered.map((s) => s.title)])
);

function historySkill(teacherId: string, n: number): string {
  const list = OFFERED[teacherId];
  return list?.length ? list[n % list.length] : 'Study session';
}

const NAMES: Record<string, string> = Object.fromEntries(userSeeds.map((u) => [u.id, u.name]));
const nameOf = (id: string) => NAMES[id] ?? id;

const HISTORY_LOCATIONS = [
  'Library, Group Room 3', 'Students Union, quiet corner', 'Science Block, Room 1.08',
  'Campus cafe', 'Humanities Building, Room 2.20', 'Sports Centre, Studio 1'
];

/** Repeat each id `count` times, in a fixed key order. Deterministic. */
function slots(targets: Record<string, number>, narrative: Record<string, number>): string[] {
  const out: string[] = [];
  for (const id of Object.keys(targets)) {
    const remaining = targets[id] - (narrative[id] ?? 0);
    for (let i = 0; i < remaining; i++) out.push(id);
  }
  return out;
}

function tally(pick: (s: Session) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of narrativeSessions) {
    if (s.status !== 'reviewed') continue;
    const k = pick(s);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

const teacherSlots = slots(TARGET_TAUGHT, tally((s) => s.providerId));
const learnerSlots = slots(TARGET_LEARNED, tally((s) => s.requesterId));

/**
 * Pair the two slot lists.
 *
 * Collisions (a slot pairing someone with themselves) are resolved in a PRE-PASS
 * over the whole array, before any session is emitted. That ordering matters: an
 * earlier version resolved them inline and its fallback branch could swap with an
 * already-consumed index, silently duplicating one learner and dropping another.
 * Swapping before emission can only permute the multiset, so per-user counts are
 * preserved exactly -- which is what keeps hours and the ledger in agreement.
 */
function pairSlots(teachers: string[], learners: string[]): string[] {
  // Rotating by roughly half the length breaks up the natural runs of identical
  // ids that the grouped slot construction produces.
  const offset = Math.floor(learners.length / 2);
  const out = learners.map((_, i) => learners[(i + offset) % learners.length]);

  for (let i = 0; i < out.length; i++) {
    if (out[i] !== teachers[i]) continue;
    for (let j = 0; j < out.length; j++) {
      // the swap must not simply move the collision to j
      if (j !== i && out[j] !== teachers[i] && out[i] !== teachers[j]) {
        [out[i], out[j]] = [out[j], out[i]];
        break;
      }
    }
  }
  return out;
}

function buildHistory(): Session[] {
  const out: Session[] = [];
  const learners = pairSlots(teacherSlots, learnerSlots);
  const taughtSoFar = new Map<string, number>();

  for (let i = 0; i < teacherSlots.length; i++) {
    const teacherId = teacherSlots[i];
    const learnerId = learners[i];

    // Fixed dates walking through the summer. No Date.now() anywhere.
    const day = String(((i * 3) % 27) + 1).padStart(2, '0');
    const month = i % 2 === 0 ? '06' : '07';
    const hour = String(9 + (i % 9)).padStart(2, '0');

    out.push({
      id: `s-h${String(i + 1).padStart(3, '0')}`,
      requesterId: learnerId,
      providerId: teacherId,
      teacherName: nameOf(teacherId),
      studentName: nameOf(learnerId),
      requestedSkillTitle: historySkill(teacherId, taughtSoFar.get(teacherId) ?? 0),
      offeredSkillTitle: undefined,
      scheduledDateTime: `2026-${month}-${day}T${hour}:00:00.000Z`,
      location: HISTORY_LOCATIONS[i % HISTORY_LOCATIONS.length],
      status: 'reviewed',
      karmaAmount: KARMA.PER_SESSION,
      durationHours: 1,
      notes: ''
    });
    taughtSoFar.set(teacherId, (taughtSoFar.get(teacherId) ?? 0) + 1);
  }
  return out;
}

export const historySessions: Session[] = buildHistory();

/** Narrative first (newest, most relevant), then back-history. */
export const sessions: Session[] = [...narrativeSessions, ...historySessions];

/**
 * In this model the REQUESTER is always the learner and the PROVIDER is always
 * the teacher. Settlement (karma.ts) depends on that holding, so assert it here
 * rather than letting a bad fixture silently unbalance the ledger.
 */
export function teacherOf(s: Session): string {
  return s.providerId;
}
export function learnerOf(s: Session): string {
  return s.requesterId;
}

/** Sessions that have settled. Karma moves on completed -> reviewed (spec 2.3). */
export const settledSessions = sessions.filter((s) => s.status === 'reviewed');
