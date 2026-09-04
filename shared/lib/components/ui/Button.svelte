<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  // Geometry from the Flutter theme: radius 14, elevation 0, h20/v14 padding,
  // 14px w700 label with -0.1 tracking. Flat + border, never a shadow.
  export const button = cva(
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-bold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0',
    {
      variants: {
        variant: {
          primary: 'bg-(--color-primary) text-white hover:bg-(--color-brand-hover)',
          secondary: 'bg-(--color-elevated) text-(--color-ink) hover:bg-(--color-line)',
          outline:
            'border-[1.4px] border-(--color-line) text-(--color-ink) hover:bg-(--color-elevated)',
          ghost: 'text-(--color-ink) hover:bg-(--color-elevated)',
          link: 'text-(--color-primary) underline-offset-4 hover:underline',
          danger: 'bg-(--color-danger) text-white hover:brightness-110',
          karma: 'bg-gradient-karma text-white hover:brightness-105'
        },
        size: {
          sm: 'h-9 px-3.5 text-[0.8125rem] [&_svg]:size-4',
          md: 'h-11 px-5 text-[0.875rem] tracking-[-0.1px] [&_svg]:size-[18px]',
          lg: 'h-12 px-6 text-[0.9375rem] [&_svg]:size-5',
          icon: 'size-11 [&_svg]:size-[18px]',
          'icon-sm': 'size-9 [&_svg]:size-4'
        },
        full: { true: 'w-full', false: '' }
      },
      defaultVariants: { variant: 'primary', size: 'md', full: false }
    }
  );

  export type ButtonVariant = VariantProps<typeof button>['variant'];
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { cn } from '../../utils/cn';

  type Props = {
    variant?: VariantProps<typeof button>['variant'];
    size?: VariantProps<typeof button>['size'];
    full?: boolean;
    href?: string;
    class?: string;
    children: Snippet;
  } & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'size'>;

  let {
    variant = 'primary',
    size = 'md',
    full = false,
    href,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

{#if href}
  <a {href} class={cn(button({ variant, size, full }), className)} {...rest}>
    {@render children()}
  </a>
{:else}
  <button type="button" class={cn(button({ variant, size, full }), className)} {...rest}>
    {@render children()}
  </button>
{/if}
