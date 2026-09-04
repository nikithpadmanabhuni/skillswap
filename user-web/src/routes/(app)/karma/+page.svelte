<script lang="ts">
  import { ArrowDownLeft, ArrowUpRight, Gift, Sparkles, TrendingUp, Wallet } from 'lucide-svelte';
  import { Button, Card, StatTile, Tabs } from '$shared/components/ui';
  import { EmptyState, KarmaBadge, SectionHeader } from '$shared/components/domain';
  import { CURRENT_USER_ID, KARMA, currentUser, ledgerFor } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';
  import type { KarmaReason } from '$shared/types';

  const ledger = ledgerFor(CURRENT_USER_ID);

  let filter = $state<'all' | 'earned' | 'spent'>('all');
  const shown = $derived(
    ledger.filter((t) =>
      filter === 'all' ? true : filter === 'earned' ? t.amount > 0 : t.amount < 0
    )
  );

  const earned = ledger.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = ledger.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

  const REASON_ICONS: Record<KarmaReason, typeof Sparkles> = {
    joining_grant: Sparkles,
    teach: ArrowUpRight,
    learn: ArrowDownLeft,
    mesh: TrendingUp,
    redemption: Gift
  };
</script>

<svelte:head><title>Karma wallet · SkillSwap Campus</title></svelte:head>

<SectionHeader title="Karma wallet" level={1} subtitle="Every credit here was debited from someone else." />

<Card class="mt-3 flex flex-col items-center gap-3 bg-gradient-karma py-8 text-white">
  <p class="text-[0.75rem] font-bold tracking-wide uppercase opacity-90">Balance</p>
  <p class="text-[3.25rem] leading-none font-black tabular-nums">{currentUser.karmaBalance}</p>
  <p class="text-[0.875rem] opacity-90">
    Enough for {Math.floor(currentUser.karmaBalance / KARMA.PER_SESSION)} more sessions
  </p>
  <div class="mt-2 flex gap-2">
    <Button href="/perks" variant="secondary" size="sm"><Gift /> Spend on perks</Button>
    <Button href="/explore" variant="secondary" size="sm">Earn more</Button>
  </div>
</Card>

<div class="mt-4 grid gap-3 sm:grid-cols-3">
  <StatTile label="Earned" value={`+${earned}`} icon={ArrowUpRight} tone="emerald" sub="Teaching and your joining grant" />
  <StatTile label="Spent" value={`-${spent}`} icon={ArrowDownLeft} tone="karma" sub="Learning and perk redemptions" />
  <StatTile label="Transactions" value={ledger.length} icon={Wallet} sub="Full history, nothing hidden" />
</div>

<SectionHeader title="Transaction log" class="mt-6" />
<Tabs
  tabs={[
    { value: 'all', label: 'All', count: ledger.length },
    { value: 'earned', label: 'Earned', count: ledger.filter((t) => t.amount > 0).length },
    { value: 'spent', label: 'Spent', count: ledger.filter((t) => t.amount < 0).length }
  ]}
  bind:value={filter}
/>

<div id="panel-{filter}" role="tabpanel" aria-labelledby="tab-{filter}" tabindex="-1" class="mt-3">
  {#if shown.length}
    <ul class="flex flex-col gap-2">
      {#each shown as t (t.id)}
        {@const Icon = REASON_ICONS[t.reason]}
        <li
          class="flex items-center gap-3 rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) px-4 py-3"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-full {t.amount > 0
              ? 'bg-(--color-emerald)/14 text-(--color-emerald)'
              : 'bg-(--color-karma)/14 text-(--color-warning)'}"
          >
            <Icon class="size-4" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[0.875rem] font-bold text-(--color-ink)">{t.title}</p>
            <p class="truncate text-[0.75rem] text-(--color-ink-muted)">
              {t.peerName} · <time datetime={t.timestamp}>{formatDate(t.timestamp)}</time>
            </p>
          </div>
          <KarmaBadge amount={t.amount} size="sm" glow={false} signed />
        </li>
      {/each}
    </ul>
  {:else}
    <Card padded={false}>
      <EmptyState icon={Wallet} title="Nothing here" body="No transactions of that kind yet." />
    </Card>
  {/if}
</div>
