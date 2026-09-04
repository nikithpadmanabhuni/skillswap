<script lang="ts">
  import { Zap } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  // Flutter KarmaBadge: gradient #F59E0B -> #D97706, radius 20, padding h14/v7,
  // glow #F59E0B@40% blur 10 y+4, icon 18, label 13 bold. The glow is the one
  // place the flat system deliberately breaks its own rule — it is the currency.
  let {
    amount,
    size = 'md',
    glow = true,
    signed = false,
    class: className
  }: {
    amount: number;
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
    signed?: boolean;
    class?: string;
  } = $props();

  const sizes = {
    sm: 'px-2.5 py-1 text-[0.6875rem] gap-1 [&_svg]:size-3',
    md: 'px-3.5 py-[7px] text-[0.8125rem] gap-1.5 [&_svg]:size-[18px]',
    lg: 'px-5 py-2.5 text-[1.125rem] gap-2 [&_svg]:size-6'
  };
  const text = $derived(signed && amount > 0 ? `+${amount}` : String(amount));
</script>

<span
  class={cn(
    'inline-flex items-center rounded-[var(--radius-badge)] bg-gradient-karma font-bold tracking-[0.2px] text-white',
    sizes[size],
    className
  )}
  style={glow ? 'box-shadow:0 4px 10px color-mix(in srgb,var(--color-karma) 40%,transparent)' : ''}
>
  <Zap class="fill-current" />
  <span class="tabular-nums">{text}</span>
</span>
