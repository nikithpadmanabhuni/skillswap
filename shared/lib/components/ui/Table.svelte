<script lang="ts" module>
  export interface Column<Row = unknown> {
    key: string;
    header: string;
    /** tailwind width/alignment classes for this column */
    class?: string;
    numeric?: boolean;
    /** marks the column as unused-generic-safe */
    _row?: Row;
  }
</script>

<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  let {
    columns,
    rows,
    rowKey,
    caption,
    empty = 'Nothing to show.',
    class: className,
    cell,
    onRowClick
  }: {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    caption?: string;
    empty?: string;
    class?: string;
    cell: Snippet<[T, string]>;
    onRowClick?: (row: T) => void;
  } = $props();
</script>

<!-- Wide tables scroll inside their own container; the page never scrolls sideways. -->
<div
  class={cn(
    'overflow-x-auto rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card)',
    className
  )}
>
  <table class="w-full border-collapse text-left">
    {#if caption}
      <caption class="sr-only">{caption}</caption>
    {/if}
    <thead>
      <tr class="border-b-[1.2px] border-(--color-line)">
        {#each columns as col (col.key)}
          <th
            scope="col"
            class={cn(
              'px-4 py-3 text-[0.75rem] font-bold tracking-wide text-(--color-ink-muted) uppercase',
              col.numeric && 'text-right tabular-nums',
              col.class
            )}
          >
            {col.header}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (rowKey(row))}
        <tr
          class={cn(
            'border-b-[1.2px] border-(--color-line) last:border-b-0',
            onRowClick && 'cursor-pointer transition-colors hover:bg-(--color-elevated)/50'
          )}
          onclick={onRowClick ? () => onRowClick(row) : undefined}
        >
          {#each columns as col (col.key)}
            <td
              class={cn(
                'px-4 py-3 align-middle text-[0.8125rem] text-(--color-ink-secondary)',
                col.numeric && 'text-right tabular-nums',
                col.class
              )}
            >
              {@render cell(row, col.key)}
            </td>
          {/each}
        </tr>
      {:else}
        <tr>
          <td
            colspan={columns.length}
            class="px-4 py-10 text-center text-[0.875rem] text-(--color-ink-muted)"
          >
            {empty}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
