<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  // Flutter SectionHeader: v8 padding, title 18/w800, 2px gap, subtitle 13/w500.
  let {
    title,
    subtitle,
    level = 2,
    class: className,
    action
  }: {
    title: string;
    subtitle?: string;
    /**
     * Heading level. Pages that use this as their page title pass level={1}:
     * a document with no h1, or with several, is harder to navigate with a
     * screen reader and fails the WCAG 2.1 AA structure the spec asks for.
     */
    level?: 1 | 2 | 3;
    class?: string;
    action?: Snippet;
  } = $props();
</script>

<div class={cn('flex items-end justify-between gap-4 py-2', className)}>
  <div class="min-w-0">
    <svelte:element
      this={`h${level}`}
      class={cn(
        'leading-tight font-extrabold tracking-[-0.3px] text-(--color-ink)',
        level === 1 ? 'text-[1.5rem]' : 'text-[1.125rem]'
      )}
    >
      {title}
    </svelte:element>
    {#if subtitle}
      <p class="mt-0.5 text-[0.8125rem] font-medium text-(--color-ink-muted)">{subtitle}</p>
    {/if}
  </div>
  {#if action}<div class="shrink-0">{@render action()}</div>{/if}
</div>
