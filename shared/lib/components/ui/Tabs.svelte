<script lang="ts">
  import { cn } from '../../utils/cn';

  // Roving-tabindex tablist: arrows move between tabs, Tab leaves the group.
  let {
    tabs,
    value = $bindable(''),
    class: className
  }: {
    tabs: Array<{ value: string; label: string; count?: number }>;
    value?: string;
    class?: string;
  } = $props();

  let refs: HTMLButtonElement[] = $state([]);

  function onkeydown(e: KeyboardEvent, i: number) {
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: tabs.length - 1
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const idx = (next + tabs.length) % tabs.length;
    value = tabs[idx].value;
    refs[idx]?.focus();
  }
</script>

<div
  role="tablist"
  class={cn(
    'flex gap-1 overflow-x-auto rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) bg-(--color-card) p-1',
    className
  )}
>
  {#each tabs as tab, i (tab.value)}
    <button
      bind:this={refs[i]}
      type="button"
      role="tab"
      id="tab-{tab.value}"
      aria-selected={value === tab.value}
      aria-controls="panel-{tab.value}"
      tabindex={value === tab.value ? 0 : -1}
      onclick={() => (value = tab.value)}
      onkeydown={(e) => onkeydown(e, i)}
      class={cn(
        'flex-1 rounded-[10px] px-3 py-2 text-[0.8125rem] font-bold whitespace-nowrap transition-colors',
        value === tab.value
          ? 'bg-(--color-primary) text-white'
          : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'
      )}
    >
      {tab.label}
      {#if tab.count !== undefined}
        <span class={cn('ml-1 tabular-nums', value === tab.value ? 'opacity-80' : 'opacity-60')}>
          {tab.count}
        </span>
      {/if}
    </button>
  {/each}
</div>
