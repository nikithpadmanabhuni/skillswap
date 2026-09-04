<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '../../utils/cn';

  // Flutter CardTheme: radius 20, 1.2px border, elevation 0. The whole system is
  // flat with a hairline border — resist adding shadows here.
  type Props = {
    class?: string;
    padded?: boolean;
    interactive?: boolean;
    children: Snippet;
  } & HTMLAttributes<HTMLDivElement>;

  let { class: className, padded = true, interactive = false, children, ...rest }: Props =
    $props();
</script>

<div
  class={cn(
    'rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card)',
    padded && 'p-5',
    interactive &&
      'transition-colors duration-150 hover:border-(--color-primary)/45 hover:bg-(--color-elevated)/40',
    className
  )}
  {...rest}
>
  {@render children()}
</div>
