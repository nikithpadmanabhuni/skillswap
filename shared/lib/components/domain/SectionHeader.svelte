<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  // Flutter SectionHeader: v8 padding, title 18/w800, 2px gap, subtitle 13/w500.
  let {
    title,
    subtitle,
    class: className,
    action
  }: { title: string; subtitle?: string; class?: string; action?: Snippet } = $props();
</script>

<div class={cn('flex items-end justify-between gap-4 py-2', className)}>
  <div class="min-w-0">
    <h2 class="text-[1.125rem] leading-tight font-extrabold tracking-[-0.3px] text-(--color-ink)">
      {title}
    </h2>
    {#if subtitle}
      <p class="mt-0.5 text-[0.8125rem] font-medium text-(--color-ink-muted)">{subtitle}</p>
    {/if}
  </div>
  {#if action}<div class="shrink-0">{@render action()}</div>{/if}
</div>
