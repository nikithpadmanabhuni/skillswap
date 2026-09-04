/**
 * Domain types, ported from lib/domain/models/*.dart.
 *
 * Two deliberate departures from the Dart originals:
 *  - CampusPerk and CampusBadge carried Flutter `IconData` / `Color` fields.
 *    Those are replaced with string keys resolved by the icon/colour layer,
 *    so the types stay framework-free.
 *  - All timestamps are fixed ISO strings. Nothing in this layer calls
 *    Date.now() — audit P2 flagged a non-deterministic sort comparator.
 */

/* ------------------------------------------------------------------ skills */

export const SKILL_CATEGORIES = [
  'tech',
  'music',
  'arts',
  'cooking',
  'languages',
  'fitness',
  'academics'
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  tech: 'Coding & Tech',
  music: 'Music & Instruments',
  arts: 'Design & Visual Arts',
  cooking: 'Culinary & Cooking',
  languages: 'Languages',
  fitness: 'Fitness & Wellness',
  academics: 'Academics & Tutoring'
};

export const SKILL_LEVELS = ['beginner', 'intermediate', 'expert'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert'
};

export interface Skill {
  id: string;
  title: string;
  category: SkillCategory;
  level: SkillLevel;
  description: string;
  isOffering: boolean;
}

/* -------------------------------------------------------------------- user */

export interface NotificationSettings {
  all: boolean;
  sessionReminders: boolean;
  karmaAlerts: boolean;
  swapRequests: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  campus: string;
  major: string;
  bio: string;
  avatarUrl: string;
  karmaBalance: number;
  rating: number;
  reviewCount: number;
  hoursTaught: number;
  hoursLearned: number;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  availability: string[];
  notificationSettings: NotificationSettings;
  /** admin-side only; never surfaced in the student app */
  status?: 'active' | 'suspended' | 'pending';
  joinedAt?: string;
}

/**
 * The PII-free projection. Audit P1-4: the Flutter app streamed the whole
 * `users` collection — emails and phone numbers included — to every client.
 * Peer-facing screens read this shape and never the full User.
 */
export type PublicProfile = Omit<User, 'email' | 'phoneNumber' | 'notificationSettings'>;

/* ----------------------------------------------------------------- session */

export const SESSION_STATUSES = [
  'pending',
  'accepted',
  'scheduled',
  'completed',
  'reviewed',
  'declined'
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const STATUS_LABELS: Record<SessionStatus, string> = {
  pending: 'Pending approval',
  accepted: 'Accepted',
  scheduled: 'Scheduled',
  completed: 'Completed',
  reviewed: 'Reviewed',
  declined: 'Declined'
};

export interface Session {
  id: string;
  requesterId: string;
  providerId: string;
  teacherName: string;
  studentName: string;
  requestedSkillTitle: string;
  offeredSkillTitle?: string;
  scheduledDateTime?: string;
  location: string;
  status: SessionStatus;
  karmaAmount: number;
  durationHours: number;
  notes: string;
}

/* ----------------------------------------------------------------- messages */

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystemEvent: boolean;
}

/* ------------------------------------------------------------------ reviews */

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number;
  comment: string;
  skillName: string;
  createdAt: string;
}

/* -------------------------------------------------------------------- karma */

export type KarmaReason =
  | 'joining_grant'
  | 'teach'
  | 'learn'
  | 'mesh'
  | 'redemption';

export interface KarmaTransaction {
  id: string;
  userId: string;
  title: string;
  /** positive = credited, negative = debited */
  amount: number;
  reason: KarmaReason;
  timestamp: string;
  peerName: string;
}

/* -------------------------------------------------------------------- perks */

export interface CampusPerk {
  id: string;
  title: string;
  category: string;
  description: string;
  karmaCost: number;
  /** lucide icon key, resolved by $shared/components/domain/PerkIcon */
  icon: string;
  /** design-token key, not a raw colour */
  themeColor: 'brand' | 'emerald' | 'karma' | 'ocean' | 'violet' | 'danger';
  vendor: string;
  active: boolean;
}

export interface Redemption {
  id: string;
  perkId: string;
  perkTitle: string;
  userId: string;
  userName: string;
  code: string;
  karmaCost: number;
  createdAt: string;
  status: 'issued' | 'honoured' | 'expired';
  honouredAt?: string;
}

/* ------------------------------------------------------------------- badges */

export interface CampusBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  themeColor: 'brand' | 'emerald' | 'karma' | 'ocean' | 'violet';
  isUnlocked: boolean;
}

/* --------------------------------------------------------------- match/mesh */

export interface SwapMatch {
  targetUserId: string;
  isMutual: boolean;
  matchPercentage: number;
  matchedOfferSkill: Skill;
  matchedWantSkill?: Skill;
  reasoning: string;
  sameCampus: boolean;
}

export interface MeshMilestone {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface CircularMeshMatch {
  id: string;
  userAId: string;
  userBId: string;
  userCId: string;
  skillAtoB: Skill;
  skillBtoC: Skill;
  skillCtoA: Skill;
  synergyScore: number;
  reasoning: string;
  milestones: MeshMilestone[];
  /**
   * A plain reference id. The Flutter app rendered
   * `SHA256-<32-bit hashCode>-VERIFIED`, which was not a SHA-256 of anything.
   * Spec section 3.2: issue a real signed credential or drop the crypto language.
   */
  referenceId: string;
  createdAt: string;
  status: 'active' | 'completed';
}

/* ----------------------------------------------------------- notifications */

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: 'session' | 'karma' | 'swap' | 'mesh' | 'system';
  timestamp: string;
  read: boolean;
  href?: string;
}

/* ------------------------------------------------------------ admin: moderation */

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  subjectId: string;
  subjectName: string;
  reason: 'harassment' | 'no_show' | 'spam' | 'misrepresented_skill' | 'other';
  detail: string;
  createdAt: string;
  status: 'open' | 'resolved' | 'dismissed';
  resolutionNote?: string;
}
