<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { cn } from '../../utils/cn';
  import { dur, EASE } from '../../motion';

  let {
    open = $bindable(false),
    title,
    description,
    size = 'md',
    class: className,
    children,
    footer
  }: {
    open?: boolean;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    children: Snippet;
    footer?: Snippet;
  } = $props();

  const uid = $props.id();
  let panel = $state<HTMLDivElement | null>(null);
  let restoreTo: HTMLElement | null = null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  // Focus moves into the dialog on open and returns to the trigger on close.
  $effect(() => {
    if (open) {
      restoreTo = document.activeElement as HTMLElement | null;
      queueMicrotask(() => {
        const target = panel?.querySelector<HTMLElement>(
          '[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (target ?? panel)?.focus();
      });
    } else if (restoreTo) {
      restoreTo.focus();
      restoreTo = null;
    }
  });

  /** Keeps Tab inside the panel while it is open (spec task 2.7). */
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      open = false;
      return;
    }
    if (e.key !== 'Tab' || !panel) return;

    const focusable = [
      ...panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
</script>

<svelte:window onkeydown={open ? onkeydown : undefined} />

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
    <!-- Backdrop. The panel below is the labelled dialog; this is decoration. -->
    <div
      class="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      transition:fade={{ duration: dur(150) }}
      onclick={() => (open = false)}
      aria-hidden="true"
    ></div>

    <div
      bind:this={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dlg-{uid}-title"
      aria-describedby={description ? `dlg-${uid}-desc` : undefined}
      tabindex="-1"
      transition:scale={{ duration: dur(180), start: 0.96, easing: (t) => t }}
      style="--ease:{EASE.out}"
      class={cn(
        'relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-6',
        widths[size],
        className
      )}
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 id="dlg-{uid}-title" class="text-title-lg text-(--color-ink)">{title}</h2>
          {#if description}
            <p id="dlg-{uid}-desc" class="mt-1 text-body-md text-(--color-ink-muted)">
              {description}
            </p>
          {/if}
        </div>
        <button
          type="button"
          onclick={() => (open = false)}
          aria-label="Close dialog"
          class="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-[var(--radius-button)] text-(--color-ink-muted) transition-colors hover:bg-(--color-elevated) hover:text-(--color-ink)"
        >
          <X class="size-[18px]" />
        </button>
      </div>

      {@render children()}

      {#if footer}
        <div class="mt-6 flex flex-wrap justify-end gap-2">{@render footer()}</div>
      {/if}
    </div>
  </div>
{/if}
