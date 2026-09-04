/**
 * Karma constants — ONE definition, used everywhere.
 *
 * Spec section 4.4 decision 1 asked for a single number. The Flutter code awarded
 * 10 while the marketing copy claimed 50/hr and 100/mesh; 10 was chosen. Any
 * screen that shows a karma figure reads it from here rather than hardcoding.
 */
export const KARMA = {
  JOINING_GRANT: 60,
  PER_SESSION: 10,
  /**
   * A 3-way mesh credits each participant 10 for the session they teach and
   * debits 10 for the session they learn — net zero, exactly like a 1:1 swap.
   *
   * NOTE: spec section 2.1 lists "complete a 3-way mesh: +10 to each participant"
   * as a flat credit, which would mint 30 Karma from nothing and contradicts the
   * same section's stated design intent ("the economy should be closed; total
   * supply changes only through the joining grant and perk redemption"). We
   * implement the closed reading. Flagged for the product owner.
   */
  MESH_TEACH: 10,
  MESH_LEARN: 10
} as const;

/** Badge unlock thresholds, from spec section 2.4. */
export const BADGE_THRESHOLDS = {
  MASTER_TUTOR_HOURS: 10,
  FIVE_STAR_RATING: 4.8,
  KARMA_WEALTHY: 150,
  MULTI_DISCIPLINE_CATEGORIES: 2
} as const;

/** Match feed pagination, from spec section 4.5 (performance). */
export const PAGE_SIZE = 20;

/**
 * Fixed "now" for the whole mock dataset. Nothing calls Date.now() — audit P2
 * found a sort comparator that did, making the order non-deterministic.
 */
export const NOW = '2026-09-04T14:00:00.000Z';

export const CAMPUS = 'Northgate University';
