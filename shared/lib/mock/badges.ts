import type { CampusBadge, User } from '../types';
import { BADGE_THRESHOLDS } from './constants';
import { meshes } from './mesh';

/**
 * The five achievement badges, evaluated as pure predicates over user state
 * (spec 2.4). Server-side evaluation in the real build; here they are computed
 * from the same derived User the rest of the app reads, so a badge can never
 * disagree with the stats shown next to it.
 */
export function badgesFor(user: User): CampusBadge[] {
  const categories = new Set(user.skillsOffered.map((s) => s.category));
  const inCompletedMesh = meshes.some(
    (m) =>
      m.status === 'completed' && [m.userAId, m.userBId, m.userCId].includes(user.id)
  );

  return [
    {
      id: 'b-mesh',
      title: '3-Way Synergy Pioneer',
      description: 'Complete a three-way skill mesh.',
      icon: 'triangle',
      themeColor: 'violet',
      isUnlocked: inCompletedMesh
    },
    {
      id: 'b-tutor',
      title: 'Master Tutor',
      description: `Teach for ${BADGE_THRESHOLDS.MASTER_TUTOR_HOURS} hours.`,
      icon: 'graduation-cap',
      themeColor: 'brand',
      isUnlocked: user.hoursTaught >= BADGE_THRESHOLDS.MASTER_TUTOR_HOURS
    },
    {
      id: 'b-fivestar',
      title: '5-Star Mentor',
      description: `Hold a rating of ${BADGE_THRESHOLDS.FIVE_STAR_RATING} or above.`,
      icon: 'star',
      themeColor: 'karma',
      isUnlocked: user.rating >= BADGE_THRESHOLDS.FIVE_STAR_RATING
    },
    {
      id: 'b-wealthy',
      title: 'Karma Wealthy',
      description: `Hold ${BADGE_THRESHOLDS.KARMA_WEALTHY} Karma at once.`,
      icon: 'zap',
      themeColor: 'emerald',
      isUnlocked: user.karmaBalance >= BADGE_THRESHOLDS.KARMA_WEALTHY
    },
    {
      id: 'b-scholar',
      title: 'Multi-Discipline Scholar',
      description: `Offer skills in ${BADGE_THRESHOLDS.MULTI_DISCIPLINE_CATEGORIES} or more categories.`,
      icon: 'library',
      themeColor: 'ocean',
      isUnlocked: categories.size >= BADGE_THRESHOLDS.MULTI_DISCIPLINE_CATEGORIES
    }
  ];
}
