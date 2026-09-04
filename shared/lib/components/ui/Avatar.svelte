<script lang="ts">
  import { cn } from '../../utils/cn';

  // Flutter UserAvatar: circle, fallback bg primary@20%, initial at radius*0.8.
  let {
    name,
    src = '',
    size = 40,
    class: className
  }: { name: string; src?: string; size?: number; class?: string } = $props();

  const initials = $derived(
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
  );
</script>

{#if src}
  <img
    {src}
    alt=""
    class={cn('shrink-0 rounded-full object-cover', className)}
    style="width:{size}px;height:{size}px"
  />
{:else}
  <span
    aria-hidden="true"
    class={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full bg-(--color-primary)/20 font-bold text-(--color-primary)',
      className
    )}
    style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.38)}px"
  >
    {initials}
  </span>
{/if}
