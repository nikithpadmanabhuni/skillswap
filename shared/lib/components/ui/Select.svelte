<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  type Option = { value: string; label: string };

  let {
    label,
    options,
    value = $bindable(''),
    class: className,
    id,
    ...rest
  }: {
    label?: string;
    options: Option[];
    value?: string;
    class?: string;
    id?: string;
    [key: string]: unknown;
  } = $props();

  const uid = $props.id();
  const fieldId = $derived(id ?? `sel-${uid}`);
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label for={fieldId} class="text-[0.875rem] font-semibold text-(--color-ink-secondary)">
      {label}
    </label>
  {/if}
  <div class="relative">
    <select
      id={fieldId}
      bind:value
      class="w-full appearance-none rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-3.5 pr-10 pl-4 text-[0.9375rem] font-medium text-(--color-ink) transition-colors outline-none focus:border-2 focus:border-(--color-primary)"
      {...rest}
    >
      {#each options as o (o.value)}
        <option value={o.value}>{o.label}</option>
      {/each}
    </select>
    <ChevronDown
      class="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)"
    />
  </div>
</div>
