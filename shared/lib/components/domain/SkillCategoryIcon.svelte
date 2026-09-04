<script lang="ts" module>
  import {
    Code,
    Music,
    Palette,
    UtensilsCrossed,
    Languages,
    Dumbbell,
    GraduationCap
  } from 'lucide-svelte';
  import type { SkillCategory } from '../../types';

  // Mirrors the iconName on each SkillCategory in the Dart model, so the two
  // clients label a category with the same glyph.
  export const CATEGORY_ICONS = {
    tech: Code,
    music: Music,
    arts: Palette,
    cooking: UtensilsCrossed,
    languages: Languages,
    fitness: Dumbbell,
    academics: GraduationCap
  } as const;

  export const CATEGORY_TONES: Record<SkillCategory, string> = {
    tech: 'var(--color-brand)',
    music: 'var(--color-violet)',
    arts: 'var(--color-danger)',
    cooking: 'var(--color-karma)',
    languages: 'var(--color-ocean)',
    fitness: 'var(--color-emerald)',
    academics: 'var(--color-cyan)'
  };
</script>

<script lang="ts">
  let {
    category,
    class: className = 'size-4'
  }: { category: SkillCategory; class?: string } = $props();

  const Icon = $derived(CATEGORY_ICONS[category]);
</script>

<Icon class={className} style="color:{CATEGORY_TONES[category]}" />
