<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '../../utils/cn';

  // Flutter InputDecorationTheme: radius 16, 1.2px border, 2px on focus,
  // h16/v14 content padding, 14px w600 label.
  type Props = {
    label?: string;
    hint?: string;
    error?: string;
    class?: string;
    value?: string;
    id?: string;
  } & Omit<HTMLInputAttributes, 'value' | 'class'>;

  let { label, hint, error, class: className, value = $bindable(''), id, ...rest }: Props =
    $props();

  const uid = $props.id();
  const inputId = $derived(id ?? `in-${uid}`);
  const describedBy = $derived(error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined);
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label for={inputId} class="text-[0.875rem] font-semibold text-(--color-ink-secondary)">
      {label}
    </label>
  {/if}
  <input
    id={inputId}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
    class={cn(
      'w-full rounded-[var(--radius-input)] border-[1.2px] bg-(--color-card) px-4 py-3.5',
      'text-[0.9375rem] font-medium text-(--color-ink) placeholder:font-normal placeholder:text-(--color-hint)',
      'transition-colors outline-none focus:border-2 focus:px-[calc(1rem-0.4px)]',
      error
        ? 'border-(--color-danger) focus:border-(--color-danger)'
        : 'border-(--color-line) focus:border-(--color-primary)',
      'disabled:cursor-not-allowed disabled:opacity-55'
    )}
    {...rest}
  />
  {#if error}
    <p id="{inputId}-err" class="text-[0.75rem] font-semibold text-(--color-danger)">{error}</p>
  {:else if hint}
    <p id="{inputId}-hint" class="text-[0.75rem] text-(--color-ink-muted)">{hint}</p>
  {/if}
</div>
