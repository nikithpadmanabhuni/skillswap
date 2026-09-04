<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  export const badge = cva(
    'inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border font-bold whitespace-nowrap [&_svg]:shrink-0',
    {
      variants: {
        tone: {
          neutral: 'border-(--color-line) bg-(--color-elevated) text-(--color-ink-secondary)',
          brand: 'border-(--color-brand)/35 bg-(--color-brand)/12 text-(--color-primary)',
          emerald: 'border-(--color-emerald)/35 bg-(--color-emerald)/12 text-(--color-emerald)',
          karma: 'border-(--color-karma)/35 bg-(--color-karma)/12 text-(--color-warning)',
          ocean: 'border-(--color-ocean)/35 bg-(--color-ocean)/12 text-(--color-ocean)',
          violet: 'border-(--color-violet)/35 bg-(--color-violet)/12 text-(--color-violet)',
          danger: 'border-(--color-danger)/35 bg-(--color-danger)/12 text-(--color-danger)'
        },
        size: {
          sm: 'px-2 py-0.5 text-[0.6875rem] [&_svg]:size-3',
          md: 'px-2.5 py-1 text-[0.75rem] [&_svg]:size-3.5'
        }
      },
      defaultVariants: { tone: 'neutral', size: 'md' }
    }
  );
  export type BadgeTone = NonNullable<VariantProps<typeof badge>['tone']>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  let {
    tone = 'neutral',
    size = 'md',
    class: className,
    children
  }: {
    tone?: VariantProps<typeof badge>['tone'];
    size?: VariantProps<typeof badge>['size'];
    class?: string;
    children: Snippet;
  } = $props();
</script>

<span class={cn(badge({ tone, size }), className)}>{@render children()}</span>
