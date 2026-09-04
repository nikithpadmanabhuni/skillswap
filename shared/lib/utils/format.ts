/**
 * Formatting helpers. All of them take an explicit input value — nothing here
 * reads the clock, so rendering is reproducible and testable (audit P2 found a
 * comparator calling DateTime.now() per comparison).
 */

/**
 * Everything renders in campus time, not the viewer's.
 *
 * Fixture timestamps are the times sessions actually happen on campus. Rendering
 * them in the reader's timezone turns an 18:00 study session into 23:30, and
 * pushes a Friday evening slot onto Saturday -- which reads as a data bug even
 * though the underlying instant is right. A campus timetable is a local-time
 * artefact, so pin the zone.
 */
const CAMPUS_TZ = 'Europe/London';

const DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: CAMPUS_TZ
});
const DATE_FULL = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: CAMPUS_TZ
});
const TIME = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: CAMPUS_TZ
});
const MONTH = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

export const formatDate = (iso: string) => DATE.format(new Date(iso));
export const formatDateFull = (iso: string) => DATE_FULL.format(new Date(iso));
export const formatTime = (iso: string) => TIME.format(new Date(iso));
export const formatDateTime = (iso: string) => `${formatDate(iso)} at ${formatTime(iso)}`;
export const formatMonth = (yyyymm: string) => MONTH.format(new Date(`${yyyymm}-01T00:00:00Z`));

/**
 * Relative time against an explicit reference point rather than the real clock,
 * so the fixtures read consistently and snapshots do not rot.
 */
export function formatRelative(iso: string, now: string): string {
  const diff = new Date(now).getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return formatDate(iso);
}

export const pluralise = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;
