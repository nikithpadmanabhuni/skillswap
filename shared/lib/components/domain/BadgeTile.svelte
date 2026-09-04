<script lang="ts">
  import {
    GraduationCap,
    Library,
    Lock,
    Star,
    Triangle,
    Zap,
    type Icon as IconType
  } from 'lucide-svelte';
  import type { CampusBadge } from '../../types';
  import { cn } from '../../utils/cn';

  const ICONS: Record<string, typeof IconType> = {
    triangle: Triangle,
    'graduation-cap': GraduationCap,
    star: Star,
    zap: Zap,
    library: Library
  };
  const TONES: Record<CampusBadge['themeColor'], string> = {
    brand: 'var(--color-brand)',
    emerald: 'var(--color-emerald)',
    karma: 'var(--color-karma)',
    ocean: 'var(--color-ocean)',
    violet: 'var(--color-violet)'
  };

  let { badge }: { badge: CampusBadge } = $props();

  const Icon = $derived(badge.isUnlocked ? (ICONS[badge.icon] ?? Star) : Lock);
  const tone = $derived(TONES[badge.themeColor]);
</script>

<div
  class={cn(
    'flex flex-col items-center gap-2 rounded-[var(--radius-card)] border-[1.2px] p-4 text-center',
    badge.isUnlocked ? 'border-(--color-line) bg-(--color-card)' : 'border-dashed border-(--color-line) bg-transparent'
  )}
>
  <span
    class="grid size-12 place-items-center rounded-full"
    style={badge.isUnlocked
      ? `background-color:color-mix(in srgb,${tone} 15%,transparent);color:${tone}`
      : 'background-color:var(--color-elevated);color:var(--color-ink-muted)'}
  >
    <Icon class="size-5" />
  </span>
  <div>
    <p
      class={cn(
        'text-[0.8125rem] leading-tight font-bold',
        badge.isUnlocked ? 'text-(--color-ink)' : 'text-(--color-ink-muted)'
      )}
    >
      {badge.title}
    </p>
    <p class="mt-1 text-[0.6875rem] leading-snug text-(--color-ink-muted)">{badge.description}</p>
  </div>
  <span class="sr-only">{badge.isUnlocked ? 'Unlocked' : 'Locked'}</span>
</div>
