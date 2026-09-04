<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  let {
    page = $bindable(1),
    total,
    perPage,
    label = 'results',
    class: className
  }: {
    page?: number;
    total: number;
    perPage: number;
    label?: string;
    class?: string;
  } = $props();

  const pages = $derived(Math.max(1, Math.ceil(total / perPage)));
  const from = $derived(total === 0 ? 0 : (page - 1) * perPage + 1);
  const to = $derived(Math.min(page * perPage, total));

  const go = (n: number) => (page = Math.min(pages, Math.max(1, n)));
</script>

<nav class={cn('flex items-center justify-between gap-4', className)} aria-label="Pagination">
  <p class="text-[0.8125rem] text-(--color-ink-muted)" aria-live="polite">
    {from}–{to} of {total}
    {label}
  </p>
  <div class="flex items-center gap-1">
    <button
      type="button"
      onclick={() => go(page - 1)}
      disabled={page <= 1}
      aria-label="Previous page"
      class="grid size-9 place-items-center rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) text-(--color-ink) transition-colors hover:bg-(--color-elevated) disabled:pointer-events-none disabled:opacity-40"
    >
      <ChevronLeft class="size-4" />
    </button>
    <span class="px-2 text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
      {page} / {pages}
    </span>
    <button
      type="button"
      onclick={() => go(page + 1)}
      disabled={page >= pages}
      aria-label="Next page"
      class="grid size-9 place-items-center rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) text-(--color-ink) transition-colors hover:bg-(--color-elevated) disabled:pointer-events-none disabled:opacity-40"
    >
      <ChevronRight class="size-4" />
    </button>
  </div>
</nav>
