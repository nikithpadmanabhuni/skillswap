<script lang="ts">
  import type { Skill } from '../../types';
  import { LEVEL_LABELS } from '../../types';
  import { cn } from '../../utils/cn';
  import SkillCategoryIcon from './SkillCategoryIcon.svelte';

  // Flutter SkillTagChip: bg color@12%, border color@35%, radius 12, padding
  // h10/v6, icon 14, label 12/w600; level pill radius 4, size 10.
  // Offering -> emerald, wanted -> indigo.
  let {
    skill,
    showLevel = true,
    class: className
  }: { skill: Skill; showLevel?: boolean; class?: string } = $props();

  const tone = $derived(skill.isOffering ? 'var(--color-emerald)' : 'var(--color-brand)');
</script>

<span
  class={cn(
    'inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border px-2.5 py-1.5 text-[0.75rem] font-semibold',
    className
  )}
  style="background-color:color-mix(in srgb,{tone} 12%,transparent);border-color:color-mix(in srgb,{tone} 35%,transparent);color:{tone}"
>
  <SkillCategoryIcon category={skill.category} class="size-3.5" />
  <span class="text-(--color-ink)">{skill.title}</span>
  {#if showLevel}
    <span
      class="rounded-[4px] px-1.5 py-px text-[0.625rem] font-bold uppercase"
      style="background-color:color-mix(in srgb,{tone} 18%,transparent)"
    >
      {LEVEL_LABELS[skill.level]}
    </span>
  {/if}
</span>
