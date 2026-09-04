<script lang="ts">
  import { cn } from '../../utils/cn';
  import type { IconComponent } from '../icon';

  let {
    label,
    value,
    sub,
    icon: Icon,
    tone = 'neutral',
    class: className
  }: {
    label: string;
    value: string | number;
    sub?: string;
    icon?: IconComponent;
    tone?: 'neutral' | 'brand' | 'emerald' | 'karma' | 'danger';
    class?: string;
  } = $props();

  const tones = {
    neutral: 'text-(--color-ink-muted)',
    brand: 'text-(--color-primary)',
    emerald: 'text-(--color-emerald)',
    karma: 'text-(--color-karma)',
    danger: 'text-(--color-danger)'
  };
</script>

<div
  class={cn(
    'rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-4',
    className
  )}
>
  <div class="flex items-center gap-2">
    {#if Icon}<Icon class="size-4 {tones[tone]}" />{/if}
    <p class="text-[0.75rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
      {label}
    </p>
  </div>
  <p class="mt-2 text-[1.75rem] leading-none font-black tabular-nums text-(--color-ink)">
    {value}
  </p>
  {#if sub}
    <p class="mt-1.5 text-[0.75rem] text-(--color-ink-muted)">{sub}</p>
  {/if}
</div>
