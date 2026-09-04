import type { ChatMessage, Session } from '../types';
import { STATUS_LABELS } from '../types';
import { sessions } from './sessions';
import { getUser } from './store';
import { CURRENT_USER_ID } from './users';

/**
 * One chat thread per session (spec 3.1, Messaging). Threads are auto-created
 * on session creation, and state transitions post system messages into them.
 *
 * Only the narrative sessions get hand-written conversation; the generated
 * back-history gets its system messages alone, which is what a real thread
 * from four months ago would look like anyway.
 */

const SYSTEM = { senderId: 'system', senderName: 'SkillSwap', isSystemEvent: true };

function sys(sessionId: string, n: number, text: string, timestamp: string): ChatMessage {
  return { id: `${sessionId}-sys${n}`, sessionId, text, timestamp, ...SYSTEM };
}

function msg(
  sessionId: string,
  n: number,
  senderId: string,
  text: string,
  timestamp: string
): ChatMessage {
  return {
    id: `${sessionId}-m${n}`,
    sessionId,
    senderId,
    senderName: getUser(senderId)?.name ?? senderId,
    text,
    timestamp,
    isSystemEvent: false
  };
}

/** Minutes offset from a base ISO timestamp, as a fixed string. No Date.now(). */
function at(base: string, minutes: number): string {
  return new Date(new Date(base).getTime() + minutes * 60_000).toISOString();
}

const conversations: Record<string, Array<[senderId: string, text: string, minute: number]>> = {
  's-006': [
    ['u-me', 'Hi Mei-Ling — I saw your prints in the studio show, the ones on the far wall. I have my dad old Pentax and genuinely no idea how to load it.', 5],
    ['u-004', 'Ha, those are mine. Happy to help. Bring the camera and a roll of HP5 and we can do loading and metering in an hour.', 40],
    ['u-me', 'Perfect. I can trade you data structures if you still want that — I saw it on your list.', 55]
  ],
  's-007': [
    ['u-me', 'Jonas — would you be up for trading? Bouldering for algorithms help.', 10],
    ['u-005', 'Yes. I am at the wall Tuesday and Thursday mornings. Warning: I will make you warm up properly.', 95],
    ['u-me', 'Accepted. I am genuinely unfit so that is probably wise.', 120]
  ],
  's-008': [
    ['u-011', 'Aarav — I record every practice session and I have about 400 files I have never listened back to. Can Python help?', 15],
    ['u-me', 'Very much so. We can build something that scans the folder and pulls the length and date of each one. Start there?', 60],
    ['u-011', 'That alone would change my life. Wednesday works.', 80]
  ],
  's-009': [
    ['u-me', 'And the other direction — I want to actually understand why chords work rather than just memorising shapes.', 20],
    ['u-011', 'Then we start with intervals and you will hate me for twenty minutes and then it will click.', 70]
  ],
  's-010': [
    ['u-009', 'That renaming script has saved me maybe two hours a week. Thank you.', 30],
    ['u-me', 'Glad it stuck. Leave me a review when you get a second and the Karma settles.', 180]
  ],
  's-001': [
    ['u-me', 'Thanks Priya — that was the first time a G chord has not sounded like a car crash.', 70],
    ['u-002', 'You picked it up fast. Practise the change from G to C fifty times before next week and it will start to feel automatic.', 110]
  ],
  's-011': [
    ['u-me', 'Hi Lucas — any chance you could show me the basics of Unity?', 25],
    ['u-018', 'Sorry, my final project deadline is in two weeks and I am underwater. Try me next month and I would genuinely enjoy it.', 300]
  ]
};

function threadFor(s: Session): ChatMessage[] {
  const base = s.scheduledDateTime ?? '2026-09-01T10:00:00.000Z';
  const created = at(base, -60 * 72);
  const out: ChatMessage[] = [
    sys(s.id, 1, `${s.studentName} proposed a swap: ${s.requestedSkillTitle}.`, created)
  ];

  for (const [senderId, text, minute] of conversations[s.id] ?? []) {
    out.push(msg(s.id, out.length, senderId, text, at(created, minute)));
  }

  if (s.status === 'declined') {
    out.push(sys(s.id, 90, `${s.teacherName} declined the request.`, at(created, 360)));
    return out;
  }
  if (s.status === 'pending') return out;

  out.push(sys(s.id, 91, `${s.teacherName} accepted the request.`, at(created, 400)));
  if (s.status === 'accepted') return out;

  out.push(
    sys(s.id, 92, `Session scheduled for ${s.location || 'a place to be confirmed'}.`, at(created, 500))
  );
  if (s.status === 'scheduled') return out;

  out.push(sys(s.id, 93, 'Session marked complete. A review unlocks the Karma settlement.', at(base, 90)));
  if (s.status === 'completed') return out;

  out.push(
    sys(s.id, 94, `Review submitted. ${s.karmaAmount} Karma settled from ${s.studentName} to ${s.teacherName}.`, at(base, 150))
  );
  return out;
}

export const messages: ChatMessage[] = sessions.flatMap(threadFor);

export function threadFrom(sessionId: string): ChatMessage[] {
  return messages
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export interface Conversation {
  session: Session;
  peerId: string;
  peerName: string;
  last: ChatMessage;
  unread: number;
}

/** Conversation list for the current user: one thread per session they are in. */
export const conversationList: Conversation[] = sessions
  .filter((s) => s.requesterId === CURRENT_USER_ID || s.providerId === CURRENT_USER_ID)
  .map((session) => {
    const thread = threadFrom(session.id);
    const peerId =
      session.requesterId === CURRENT_USER_ID ? session.providerId : session.requesterId;
    return {
      session,
      peerId,
      peerName: getUser(peerId)?.name ?? peerId,
      last: thread[thread.length - 1],
      // Fixed, not random: threads whose last word was not ours read as unread.
      unread: thread[thread.length - 1].senderId !== CURRENT_USER_ID && !['reviewed', 'declined'].includes(session.status) ? 1 : 0
    };
  })
  .sort((a, b) => b.last.timestamp.localeCompare(a.last.timestamp));

export const STATUS_TEXT = STATUS_LABELS;
