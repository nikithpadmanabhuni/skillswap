<script lang="ts">
  import { Triangle } from 'lucide-svelte';
  import { cn } from '$shared/utils/cn';

  let {
    href = '/',
    inverse = false,
    collapse = false,
    class: className
  }: {
    href?: string;
    /** White-on-brand, for use over the brand gradient. */
    inverse?: boolean;
    /** Drop the word "Campus" below the sm breakpoint, where header space is tight. */
    collapse?: boolean;
    class?: string;
  } = $props();
</script>

<a {href} class={cn('inline-flex shrink-0 items-center gap-2.5 rounded-[var(--radius-chip)]', className)}>
  <span
    class={cn(
      'grid size-8 place-items-center rounded-[10px] text-white',
      inverse ? 'border-[1.2px] border-white/30 bg-white/15' : 'bg-gradient-brand'
    )}
  >
    <Triangle class="size-4" aria-hidden="true" />
  </span>
  <span class={cn('text-title-md leading-none', inverse ? 'text-white' : 'text-(--color-ink)')}>
    SkillSwap
    <span
      class={cn(
        'font-semibold',
        inverse ? 'text-white' : 'text-(--color-ink-muted)',
        collapse && 'max-sm:hidden'
      )}>Campus</span
    >
  </span>
</a>
