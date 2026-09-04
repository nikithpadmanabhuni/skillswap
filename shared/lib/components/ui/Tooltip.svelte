<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  // Hover AND focus, so it is reachable by keyboard.
  let {
    text,
    class: className,
    children
  }: { text: string; class?: string; children: Snippet } = $props();

  let show = $state(false);
  let host = $state<HTMLSpanElement | null>(null);
  const uid = $props.id();

  // Listeners are attached imperatively rather than declaratively: the wrapper is
  // a passive container, and giving it an ARIA role purely to satisfy the
  // static-interaction lint would be describing it as something it is not.
  $effect(() => {
    const el = host;
    if (!el) return;
    const open = () => (show = true);
    const close = () => (show = false);
    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', close);
    el.addEventListener('focusin', open);
    el.addEventListener('focusout', close);
    return () => {
      el.removeEventListener('mouseenter', open);
      el.removeEventListener('mouseleave', close);
      el.removeEventListener('focusin', open);
      el.removeEventListener('focusout', close);
    };
  });
</script>

<span bind:this={host} class={cn('relative inline-flex', className)}>
  <span aria-describedby={show ? `tip-${uid}` : undefined}>{@render children()}</span>
  {#if show}
    <span
      id="tip-{uid}"
      role="tooltip"
      class="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-40 w-max max-w-56 -translate-x-1/2 rounded-[10px] border-[1.2px] border-(--color-line) bg-(--color-card) px-2.5 py-1.5 text-[0.75rem] leading-snug font-medium text-(--color-ink)"
    >
      {text}
    </span>
  {/if}
</span>
