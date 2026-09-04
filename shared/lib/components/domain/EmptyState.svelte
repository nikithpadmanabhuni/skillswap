<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { cn } from '../../utils/cn';

  // Flutter ProfessionalEmptyState: margin h32/v24, circular icon well padding 24
  // with outline@30% 1.5px border, icon 48, gap 20, title 18/w800/-0.3, body 14.
  let {
    icon: Icon,
    title,
    body,
    class: className,
    action
  }: { icon: Component; title: string; body: string; class?: string; action?: Snippet } =
    $props();
</script>

<div class={cn('mx-auto flex max-w-md flex-col items-center px-8 py-6 text-center', className)}>
  <div class="rounded-full border-[1.5px] border-(--color-line) p-6">
    <Icon class="size-12 text-(--color-primary)" />
  </div>
  <h3 class="mt-5 text-[1.125rem] font-extrabold tracking-[-0.3px] text-(--color-ink)">
    {title}
  </h3>
  <p class="mt-2 text-[0.875rem] leading-[1.45] font-medium text-(--color-ink-muted)">{body}</p>
  {#if action}<div class="mt-5">{@render action()}</div>{/if}
</div>
