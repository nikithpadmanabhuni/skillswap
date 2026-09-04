<script lang="ts" module>
  import { dur } from '../../motion';

  export type ToastTone = 'info' | 'success' | 'error';
  export interface ToastItem {
    id: number;
    text: string;
    tone: ToastTone;
  }

  let seq = 0;

  class ToastStore {
    items = $state<ToastItem[]>([]);

    push(text: string, tone: ToastTone = 'info') {
      const id = ++seq;
      this.items = [...this.items, { id, text, tone }];
      // Reduced motion shortens the animation, not the reading time.
      setTimeout(() => this.dismiss(id), 4000);
    }

    success = (text: string) => this.push(text, 'success');
    error = (text: string) => this.push(text, 'error');

    dismiss(id: number) {
      this.items = this.items.filter((t) => t.id !== id);
    }
  }

  export const toasts = new ToastStore();
  export { dur };
</script>

<script lang="ts">
  import { CheckCircle2, Info, X, XCircle } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  const icons = { info: Info, success: CheckCircle2, error: XCircle };
  const tones = {
    info: 'text-(--color-ocean)',
    success: 'text-(--color-emerald)',
    error: 'text-(--color-danger)'
  };
</script>

<!-- Announced to screen readers; polite so it does not interrupt. -->
<div
  aria-live="polite"
  aria-atomic="false"
  class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
>
  {#each toasts.items as t (t.id)}
    {@const Icon = icons[t.tone]}
    <div
      transition:fly={{ y: 16, duration: dur(200) }}
      class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) bg-(--color-card) px-4 py-3"
    >
      <Icon class="mt-0.5 size-[18px] shrink-0 {tones[t.tone]}" />
      <p class="flex-1 text-[0.875rem] font-medium text-(--color-ink)">{t.text}</p>
      <button
        type="button"
        onclick={() => toasts.dismiss(t.id)}
        aria-label="Dismiss notification"
        class="-mt-0.5 -mr-1 grid size-7 shrink-0 place-items-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-elevated)"
      >
        <X class="size-3.5" />
      </button>
    </div>
  {/each}
</div>
