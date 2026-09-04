<script lang="ts">
  import {
    BookOpen,
    Coffee,
    Dumbbell,
    Printer,
    Users,
    UtensilsCrossed,
    type Icon as IconType
  } from 'lucide-svelte';
  import type { CampusPerk } from '../../types';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import KarmaBadge from './KarmaBadge.svelte';

  const ICONS: Record<string, typeof IconType> = {
    coffee: Coffee,
    printer: Printer,
    'book-open': BookOpen,
    dumbbell: Dumbbell,
    utensils: UtensilsCrossed,
    users: Users
  };
  const TONES: Record<CampusPerk['themeColor'], string> = {
    brand: 'var(--color-brand)',
    emerald: 'var(--color-emerald)',
    karma: 'var(--color-karma)',
    ocean: 'var(--color-ocean)',
    violet: 'var(--color-violet)',
    danger: 'var(--color-danger)'
  };

  let { perk, balance }: { perk: CampusPerk; balance: number } = $props();

  const Icon = $derived(ICONS[perk.icon] ?? Coffee);
  const tone = $derived(TONES[perk.themeColor]);
  const affordable = $derived(balance >= perk.karmaCost);
  const short = $derived(perk.karmaCost - balance);
</script>

<Card class="flex flex-col gap-3">
  <div class="flex items-start justify-between gap-3">
    <span
      class="grid size-11 shrink-0 place-items-center rounded-[var(--radius-button)]"
      style="background-color:color-mix(in srgb,{tone} 14%,transparent);color:{tone}"
    >
      <Icon class="size-5" />
    </span>
    <KarmaBadge amount={perk.karmaCost} size="sm" glow={false} />
  </div>

  <div>
    <h3 class="text-title-md text-(--color-ink)">{perk.title}</h3>
    <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-muted)">{perk.description}</p>
  </div>

  <div class="mt-auto flex items-center justify-between gap-3 border-t-[1.2px] border-(--color-line) pt-3">
    <span class="min-w-0 truncate text-[0.75rem] font-semibold text-(--color-ink-muted)">
      {perk.vendor}
    </span>
    {#if affordable}
      <Button href="/perks/{perk.id}/redeem" size="sm" variant="karma">Redeem</Button>
    {:else}
      <span class="text-[0.75rem] font-semibold text-(--color-ink-muted)">
        {short} Karma short
      </span>
    {/if}
  </div>
</Card>
