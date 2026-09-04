<script lang="ts">
  import { ArrowLeftRight, Sparkles } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  // Flutter MatchScoreBadge: bg color@15%, border color@50% 1.2px, radius 14,
  // padding h11/v6, icon 16, label 12/w800. Mutual -> emerald, one-way -> indigo.
  let {
    score,
    isMutual,
    class: className
  }: { score: number; isMutual: boolean; class?: string } = $props();

  const tone = $derived(isMutual ? 'var(--color-emerald)' : 'var(--color-brand)');
  const Icon = $derived(isMutual ? ArrowLeftRight : Sparkles);
</script>

<span
  class={cn(
    'inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border-[1.2px] px-[11px] py-1.5 text-[0.75rem] font-extrabold',
    className
  )}
  style="background-color:color-mix(in srgb,{tone} 15%,transparent);border-color:color-mix(in srgb,{tone} 50%,transparent);color:{tone}"
>
  <Icon class="size-4" />
  <span class="tabular-nums">{score}%</span>
  <span class="sr-only">{isMutual ? 'mutual match' : 'one-way match'}</span>
</span>
