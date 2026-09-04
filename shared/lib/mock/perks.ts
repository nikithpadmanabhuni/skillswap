import type { CampusPerk, Redemption } from '../types';

/** Six seeded perks, sorted by cost (spec section 3.1, Karma & perks). */
export const perks: CampusPerk[] = [
  {
    id: 'p-001',
    title: 'Free filter coffee',
    category: 'Food & Drink',
    description: 'Any size filter coffee at The Grind, the Students Union cafe. One per day.',
    karmaCost: 40,
    icon: 'coffee',
    themeColor: 'karma',
    vendor: 'The Grind (SU)',
    active: true
  },
  {
    id: 'p-002',
    title: '100 free print credits',
    category: 'Study',
    description: 'Black and white A4 at any campus print station. Credits land within an hour.',
    karmaCost: 50,
    icon: 'printer',
    themeColor: 'ocean',
    vendor: 'Campus Print Services',
    active: true
  },
  {
    id: 'p-003',
    title: 'Library group room, 2 hours',
    category: 'Study',
    description: 'Priority booking on a bookable group study room, including the ones with a screen.',
    karmaCost: 60,
    icon: 'book-open',
    themeColor: 'violet',
    vendor: 'Northgate Library',
    active: true
  },
  {
    id: 'p-004',
    title: 'Gym day pass',
    category: 'Fitness',
    description: 'Full access to the campus gym and pool for one day, guest included.',
    karmaCost: 75,
    icon: 'dumbbell',
    themeColor: 'emerald',
    vendor: 'Northgate Sport',
    active: true
  },
  {
    id: 'p-005',
    title: 'Lunch at the refectory',
    category: 'Food & Drink',
    description: 'Hot main plus a side, any weekday between 12 and 2.',
    karmaCost: 90,
    icon: 'utensils',
    themeColor: 'brand',
    vendor: 'Northgate Refectory',
    active: true
  },
  {
    id: 'p-006',
    title: 'Society membership, one term',
    category: 'Social',
    description: 'Join any one Students Union society for a term. Excludes societies with kit fees.',
    karmaCost: 100,
    icon: 'users',
    themeColor: 'danger',
    vendor: 'Students Union',
    active: true
  }
];

/**
 * Redemption records with vendor-verifiable codes.
 *
 * Spec section 3.1 flagged that the Flutter app debited Karma and produced
 * nothing a vendor could honour. The admin app's /redemptions screen is the
 * other half of this: it is where a vendor's code gets marked honoured.
 *
 * Codes are fixed strings, not generated — the dataset must be identical on
 * every load and in both apps.
 */
export const redemptions: Redemption[] = [
  {
    id: 'r-001',
    perkId: 'p-001',
    perkTitle: 'Free filter coffee',
    userId: 'u-me',
    userName: 'Aarav Mehta',
    code: 'NG-COF-7Q2M',
    karmaCost: 40,
    createdAt: '2026-08-20T09:15:00.000Z',
    status: 'honoured',
    honouredAt: '2026-08-20T09:41:00.000Z'
  },
  {
    id: 'r-002',
    perkId: 'p-002',
    perkTitle: '100 free print credits',
    userId: 'u-003',
    userName: 'Daniel Okonjo',
    code: 'NG-PRN-4K8B',
    karmaCost: 50,
    createdAt: '2026-08-24T11:02:00.000Z',
    status: 'honoured',
    honouredAt: '2026-08-24T12:20:00.000Z'
  },
  {
    id: 'r-003',
    perkId: 'p-004',
    perkTitle: 'Gym day pass',
    userId: 'u-002',
    userName: 'Priya Raghunathan',
    code: 'NG-GYM-9XR3',
    karmaCost: 75,
    createdAt: '2026-08-27T16:40:00.000Z',
    status: 'issued'
  },
  {
    id: 'r-004',
    perkId: 'p-003',
    perkTitle: 'Library group room, 2 hours',
    userId: 'u-007',
    userName: 'Tomas Nowak',
    code: 'NG-LIB-2WD6',
    karmaCost: 60,
    createdAt: '2026-08-31T08:30:00.000Z',
    status: 'issued'
  },
  {
    id: 'r-005',
    perkId: 'p-001',
    perkTitle: 'Free filter coffee',
    userId: 'u-016',
    userName: 'Ben Carter',
    code: 'NG-COF-5T1P',
    karmaCost: 40,
    createdAt: '2026-09-01T07:55:00.000Z',
    status: 'issued'
  },
  {
    id: 'r-006',
    perkId: 'p-005',
    perkTitle: 'Lunch at the refectory',
    userId: 'u-020',
    userName: 'Ines Duarte',
    code: 'NG-LUN-8H4Z',
    karmaCost: 90,
    createdAt: '2026-07-18T12:05:00.000Z',
    status: 'expired'
  }
];
