<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { cn } from '../../utils/cn';
  import { dur } from '../../motion';

  // Mobile-first slide-over. Used for filters on /explore and the admin nav drawer.
  let {
    open = $bindable(false),
    title,
    side = 'right',
    class: className,
    children
  }: {
    open?: boolean;
    title: string;
    side?: 'left' | 'right' | 'bottom';
    class?: string;
    children: Snippet;
  } = $props();

  const uid = $props.id();
  let panel = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (open) queueMicrotask(() => panel?.focus());
  });

  const geometry = {
    left: 'inset-y-0 left-0 h-full w-[min(22rem,88vw)] rounded-r-[var(--radius-card)] border-r-[1.2px]',
    right: 'inset-y-0 right-0 h-full w-[min(22rem,88vw)] rounded-l-[var(--radius-card)] border-l-[1.2px]',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--radius-card)] border-t-[1.2px]'
  };
  const motion = {
    left: { x: -320, y: 0 },
    right: { x: 320, y: 0 },
    bottom: { x: 0, y: 320 }
  };
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && (open = false)} />

{#if open}
  <div class="fixed inset-0 z-50">
    <div
      class="absolute inset-0 bg-black/55"
      transition:fade={{ duration: dur(150) }}
      onclick={() => (open = false)}
      aria-hidden="true"
    ></div>
    <div
      bind:this={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-{uid}"
      tabindex="-1"
      transition:fly={{ ...motion[side], duration: dur(220) }}
      class={cn(
        'absolute overflow-y-auto border-(--color-line) bg-(--color-card) p-5',
        geometry[side],
        className
      )}
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 id="sheet-{uid}" class="text-title-md text-(--color-ink)">{title}</h2>
        <button
          type="button"
          onclick={() => (open = false)}
          aria-label="Close"
          class="grid size-9 place-items-center rounded-[var(--radius-button)] text-(--color-ink-muted) hover:bg-(--color-elevated)"
        >
          <X class="size-[18px]" />
        </button>
      </div>
      {@render children()}
    </div>
  </div>
{/if}
