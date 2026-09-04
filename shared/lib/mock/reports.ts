import type { Report } from '../types';

/**
 * Moderation queue (spec 6.3 — report/block plus a moderation queue).
 * Admin-only: this data never reaches the student app.
 */
export const reports: Report[] = [
  {
    id: 'rep-001', reporterId: 'u-012', reporterName: 'Yuki Tanaka',
    subjectId: 'u-026', subjectName: 'Victor Salt', reason: 'spam',
    detail: 'Messaged me three times about a paid course after I declined a swap. Not what the platform is for.',
    createdAt: '2026-09-02T10:12:00.000Z', status: 'open'
  },
  {
    id: 'rep-002', reporterId: 'u-018', reporterName: 'Lucas Ferreira',
    subjectId: 'u-026', subjectName: 'Victor Salt', reason: 'misrepresented_skill',
    detail: 'Listed "Social Media Growth" as expert, session was a sales pitch with no teaching in it.',
    createdAt: '2026-09-01T15:47:00.000Z', status: 'open'
  },
  {
    id: 'rep-003', reporterId: 'u-010', reporterName: 'Hannah Lindqvist',
    subjectId: 'u-023', subjectName: 'Tom Bradshaw', reason: 'no_show',
    detail: 'Booked for Tuesday 14:00 at the library, waited 40 minutes, no message.',
    createdAt: '2026-08-30T14:50:00.000Z', status: 'open'
  },
  {
    id: 'rep-004', reporterId: 'u-008', reporterName: 'Aisha Rahman',
    subjectId: 'u-025', subjectName: 'Jamie Roth', reason: 'no_show',
    detail: 'Did not turn up. First offence and they apologised afterwards.',
    createdAt: '2026-08-24T09:30:00.000Z', status: 'resolved',
    resolutionNote: 'Contacted Jamie, genuine timetable clash. Warned about cancelling in the thread. No further action.'
  },
  {
    id: 'rep-005', reporterId: 'u-019', reporterName: 'Grace Mwangi',
    subjectId: 'u-014', subjectName: 'Oliver Grant', reason: 'other',
    detail: 'Disagreement about who was teaching what. Seems like a misunderstanding rather than misconduct.',
    createdAt: '2026-08-18T11:05:00.000Z', status: 'dismissed',
    resolutionNote: 'Both parties agreed it was a mix-up over the swap direction. Nothing to action.'
  },
  {
    id: 'rep-006', reporterId: 'u-022', reporterName: 'Sarah Liu',
    subjectId: 'u-026', subjectName: 'Victor Salt', reason: 'harassment',
    detail: 'Repeated unsolicited messages after I asked them to stop.',
    createdAt: '2026-08-31T20:15:00.000Z', status: 'resolved',
    resolutionNote: 'Account suspended pending review. Two further reports since.'
  }
];

export const openReports = reports.filter((r) => r.status === 'open');
