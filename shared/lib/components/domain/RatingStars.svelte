<script lang="ts">
  import { Star } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  let {
    rating,
    count,
    size = 14,
    class: className
  }: { rating: number; count?: number; size?: number; class?: string } = $props();

  const pct = $derived(Math.max(0, Math.min(100, (rating / 5) * 100)));
</script>

<span class={cn('inline-flex items-center gap-1.5', className)}>
  <!-- Two stacked rows clipped by width: renders half-stars without extra markup. -->
  <span class="relative inline-flex" aria-hidden="true">
    <span class="flex gap-px text-(--color-line)">
      {#each { length: 5 } as _, i (i)}
        <Star style="width:{size}px;height:{size}px" class="fill-current" />
      {/each}
    </span>
    <span
      class="absolute inset-0 flex gap-px overflow-hidden text-(--color-karma)"
      style="width:{pct}%"
    >
      {#each { length: 5 } as _, i (i)}
        <Star style="width:{size}px;height:{size}px" class="shrink-0 fill-current" />
      {/each}
    </span>
  </span>
  <span class="text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
    {rating.toFixed(1)}
  </span>
  {#if count !== undefined}
    <span class="text-[0.75rem] text-(--color-ink-muted)">({count})</span>
  {/if}
  <span class="sr-only">{rating.toFixed(1)} out of 5{count !== undefined ? `, ${count} reviews` : ''}</span>
</span>
