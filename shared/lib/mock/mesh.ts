import type { CircularMeshMatch, MeshMilestone } from '../types';
import { userSeeds } from './users';

/**
 * 3-way circular meshes: A teaches B, B teaches C, C teaches A. A closed loop
 * that clears with no currency — the trades a 1:1 marketplace structurally
 * cannot see (spec 1.2).
 *
 * On the certificate field: the Flutter app rendered
 *   'SHA256-' + meshId.hashCode.abs().toRadixString(16) + '-VERIFIED'
 * which is a 32-bit non-cryptographic hash wearing the name of a 256-bit one.
 * Spec 3.2 gives two options: issue a genuinely signed credential, or drop the
 * cryptographic language. With no backend there is nothing to sign, so this is
 * a plain reference id and the UI calls it a reference, not a verification.
 */

const skillOf = (userId: string, title: string) => {
  const u = userSeeds.find((x) => x.id === userId)!;
  const s = u.skillsOffered.find((k) => k.title === title);
  if (!s) throw new Error(`mesh fixture: ${u.name} does not offer ${title}`);
  return s;
};

/** The four-phase structure from spec 2.2. */
function milestones(done: number): MeshMilestone[] {
  const phases: Array<[string, string, number]> = [
    ['Kickoff', 'All three meet, agree goals, and set the schedule for the loop.', 30],
    ['Dual-coaching lab', 'Each person teaches their session and sits in on one as a learner.', 90],
    ['Milestone check', 'Halfway review: what landed, what needs another pass.', 45],
    ['Completion', 'Final session, mutual review, and Karma settles across the loop.', 60]
  ];
  return phases.map(([title, description, durationMinutes], i) => ({
    id: `ms-${i + 1}`,
    title,
    description,
    durationMinutes,
    isCompleted: i < done
  }));
}

export const meshes: CircularMeshMatch[] = [
  {
    // The completed loop. Its three legs are sessions s-021, s-022, s-023.
    id: 'm-001',
    userAId: 'u-me',
    userBId: 'u-004',
    userCId: 'u-002',
    skillAtoB: skillOf('u-me', 'Data Structures'),
    skillBtoC: skillOf('u-004', 'Figma'),
    skillCtoA: skillOf('u-002', 'Acoustic Guitar'),
    synergyScore: 97,
    reasoning:
      'A closed loop with no currency: you teach Mei-Ling data structures, she teaches Priya Figma, and Priya teaches you guitar. None of these three pairs matches on its own.',
    milestones: milestones(4),
    referenceId: 'MESH-M001-8F3A',
    createdAt: '2026-08-05T10:00:00.000Z',
    status: 'completed'
  },
  {
    id: 'm-002',
    userAId: 'u-me',
    userBId: 'u-009',
    userCId: 'u-008',
    skillAtoB: skillOf('u-me', 'Python'),
    skillBtoC: skillOf('u-009', 'Video Editing'),
    skillCtoA: skillOf('u-008', 'Yoga'),
    synergyScore: 96,
    reasoning:
      'You teach Ravi Python for his workflow scripts, Ravi teaches Aisha editing for her class films, and Aisha teaches you yoga. Ravi wants Python, Aisha wants editing.',
    milestones: milestones(2),
    referenceId: 'MESH-M002-2C7D',
    createdAt: '2026-08-27T10:00:00.000Z',
    status: 'active'
  },
  {
    id: 'm-003',
    userAId: 'u-me',
    userBId: 'u-025',
    userCId: 'u-013',
    skillAtoB: skillOf('u-me', 'Flutter Development'),
    skillBtoC: skillOf('u-025', 'Chess'),
    skillCtoA: skillOf('u-013', 'Drawing'),
    synergyScore: 94,
    reasoning:
      'You teach Jamie Flutter, Jamie teaches Elena chess, Elena teaches you drawing. A weaker loop — Elena has not listed chess as a want — but the other two legs are exact.',
    milestones: milestones(0),
    referenceId: 'MESH-M003-5B1E',
    createdAt: '2026-09-01T10:00:00.000Z',
    status: 'active'
  }
];

export const meshesFor = (userId: string) =>
  meshes.filter((m) => [m.userAId, m.userBId, m.userCId].includes(userId));
