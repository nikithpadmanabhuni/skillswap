<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import { cn } from '../../utils/cn';

  type Props = {
    label?: string;
    hint?: string;
    error?: string;
    class?: string;
    value?: string;
    id?: string;
  } & Omit<HTMLTextareaAttributes, 'value' | 'class'>;

  let { label, hint, error, class: className, value = $bindable(''), id, rows = 4, ...rest }: Props =
    $props();

  const uid = $props.id();
  const fieldId = $derived(id ?? `ta-${uid}`);
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label for={fieldId} class="text-[0.875rem] font-semibold text-(--color-ink-secondary)">
      {label}
    </label>
  {/if}
  <textarea
    id={fieldId}
    {rows}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    class={cn(
      'w-full resize-y rounded-[var(--radius-input)] border-[1.2px] bg-(--color-card) px-4 py-3.5',
      'text-[0.9375rem] font-medium leading-relaxed text-(--color-ink) placeholder:font-normal placeholder:text-(--color-hint)',
      'transition-colors outline-none focus:border-2',
      error ? 'border-(--color-danger)' : 'border-(--color-line) focus:border-(--color-primary)'
    )}
    {...rest}
  ></textarea>
  {#if error}
    <p class="text-[0.75rem] font-semibold text-(--color-danger)">{error}</p>
  {:else if hint}
    <p class="text-[0.75rem] text-(--color-ink-muted)">{hint}</p>
  {/if}
</div>
