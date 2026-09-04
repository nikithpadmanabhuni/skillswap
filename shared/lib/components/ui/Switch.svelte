<script lang="ts">
  import { cn } from '../../utils/cn';

  let {
    checked = $bindable(false),
    label,
    description,
    disabled = false,
    class: className
  }: {
    checked?: boolean;
    label: string;
    description?: string;
    disabled?: boolean;
    class?: string;
  } = $props();

  const uid = $props.id();
</script>

<div class={cn('flex items-start justify-between gap-4', className)}>
  <div class="min-w-0">
    <label for="sw-{uid}" class="block text-[0.9375rem] font-semibold text-(--color-ink)">
      {label}
    </label>
    {#if description}
      <p class="mt-0.5 text-[0.8125rem] leading-snug text-(--color-ink-muted)">{description}</p>
    {/if}
  </div>
  <button
    id="sw-{uid}"
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    onclick={() => (checked = !checked)}
    class={cn(
      'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
      checked
        ? 'border-(--color-primary) bg-(--color-primary)'
        : 'border-(--color-line) bg-(--color-elevated)',
      disabled && 'cursor-not-allowed opacity-50'
    )}
  >
    <span
      class={cn(
        'absolute top-0.5 size-4.5 rounded-full bg-white transition-[left] duration-200',
        checked ? 'left-[22px]' : 'left-0.5'
      )}
    ></span>
  </button>
</div>
