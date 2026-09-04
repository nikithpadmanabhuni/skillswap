import type { AppNotification } from '../types';

/** In-app notification centre (spec 3.1, System). Fixed timestamps throughout. */
export const notifications: AppNotification[] = [
  { id: 'n-01', title: 'Session tomorrow', body: 'Python with Marcus Bell, 18:00, CS Building Lab 2.', kind: 'session', timestamp: '2026-09-04T09:00:00.000Z', read: false, href: '/sessions/s-008' },
  { id: 'n-02', title: 'Review outstanding', body: 'Ravi Chandrasekhar is waiting on your review. Karma settles when you submit it.', kind: 'karma', timestamp: '2026-09-03T18:30:00.000Z', read: false, href: '/sessions/s-010/review' },
  { id: 'n-03', title: 'Jonas accepted your swap', body: 'Bouldering for Data Structures. Agree a time in the thread.', kind: 'swap', timestamp: '2026-09-03T11:15:00.000Z', read: false, href: '/messages/s-007' },
  { id: 'n-04', title: 'New mesh found', body: 'A three-way loop with Ravi and Aisha scored 96. Python, editing, yoga.', kind: 'mesh', timestamp: '2026-09-02T16:40:00.000Z', read: true, href: '/mesh/m-002' },
  { id: 'n-05', title: 'Karma settled', body: 'You earned 10 Karma teaching Flutter Development to Jamie Roth.', kind: 'karma', timestamp: '2026-08-29T19:20:00.000Z', read: true, href: '/karma' },
  { id: 'n-06', title: 'Badge unlocked', body: 'Karma Wealthy — you are holding 150 Karma or more.', kind: 'system', timestamp: '2026-08-29T19:21:00.000Z', read: true, href: '/profile' },
  { id: 'n-07', title: 'Lucas declined your request', body: 'Unity — he is on a deadline. He suggested trying again next month.', kind: 'swap', timestamp: '2026-08-28T08:05:00.000Z', read: true, href: '/sessions/s-011' },
  { id: 'n-08', title: 'Perk redeemed', body: 'Free filter coffee. Code NG-COF-7Q2M, show it at The Grind.', kind: 'karma', timestamp: '2026-08-20T09:15:00.000Z', read: true, href: '/karma' },
  { id: 'n-09', title: 'Mesh completed', body: 'Your loop with Mei-Ling and Priya finished. Reference MESH-M001-8F3A.', kind: 'mesh', timestamp: '2026-08-10T17:00:00.000Z', read: true, href: '/mesh/m-001' }
];

export const unreadCount = notifications.filter((n) => !n.read).length;
