<script lang="ts">
  import { AlertTriangle, CheckCircle2, Download, Search } from 'lucide-svelte';
  import { Button, Card, Pagination, Select, StatTile, Table, toasts, type Column } from '$shared/components/ui';
  import { KarmaBadge, SectionHeader } from '$shared/components/domain';
  import { karmaHealth, karmaLedger, supplyByMonth } from '$shared/mock';
  import { formatDate, formatMonth } from '$shared/utils/format';
  import type { KarmaTransaction } from '$shared/types';

  let query = $state('');
  let reason = $state('all');
  let page = $state(1);
  const PER = 25;

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return karmaLedger.filter((t) => {
      if (reason !== 'all' && t.reason !== reason) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.userId.toLowerCase().includes(q);
    });
  });

  $effect(() => {
    void query;
    void reason;
    page = 1;
  });

  const rows = $derived(filtered.slice((page - 1) * PER, page * PER));

  const columns: Column<KarmaTransaction>[] = [
    { key: 'title', header: 'Entry' },
    { key: 'user', header: 'Account' },
    { key: 'peer', header: 'Counterparty' },
    { key: 'reason', header: 'Reason' },
    { key: 'date', header: 'Date' },
    { key: 'amount', header: 'Amount', numeric: true }
  ];

  const maxSupply = Math.max(...supplyByMonth.map((m) => m.supply), 1);
</script>

<svelte:head><title>Karma ledger · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Karma ledger" subtitle="Append-only. Balances are derived from it, never stored.">
  {#snippet action()}
    <Button size="sm" variant="outline" onclick={() => toasts.success('Ledger export queued.')}>
      <Download /> Export CSV
    </Button>
  {/snippet}
</SectionHeader>

<!--
  Integrity monitor. Spec 4.5 asks for "Karma-ledger integrity monitoring" and
  4.9 for a test proving supply changes only by grants minus redemptions. This
  is that check, surfaced where an operator will actually see it.
-->
<Card
  class="mt-3 flex flex-col gap-3 {karmaHealth.balanced
    ? 'border-(--color-emerald)/40'
    : 'border-(--color-danger)'}"
>
  <div class="flex items-start gap-3">
    <span
      class="grid size-10 shrink-0 place-items-center rounded-full {karmaHealth.balanced
        ? 'bg-(--color-emerald)/14 text-(--color-emerald)'
        : 'bg-(--color-danger)/14 text-(--color-danger)'}"
    >
      {#if karmaHealth.balanced}<CheckCircle2 class="size-5" />{:else}<AlertTriangle class="size-5" />{/if}
    </span>
    <div>
      <h2 class="text-title-md text-(--color-ink)">
        {karmaHealth.balanced ? 'Conserved' : 'Drift detected — investigate now'}
      </h2>
      <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-secondary)">
        Teach credits total {karmaHealth.teachCredits} and learn debits total
        {karmaHealth.learnDebits}. They must match exactly: a session that credits a teacher without
        debiting a learner mints currency, and the reverse destroys it.
      </p>
    </div>
  </div>
</Card>

<div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <StatTile label="In circulation" value={karmaHealth.totalSupply} tone="karma" />
  <StatTile label="Granted" value={karmaHealth.grantedTotal} tone="emerald" sub="Joining grants — the only source" />
  <StatTile label="Redeemed" value={karmaHealth.redeemedTotal} tone="brand" sub="Perks — the only sink" />
  <StatTile
    label="Drift"
    value={karmaHealth.drift}
    tone={karmaHealth.drift === 0 ? 'emerald' : 'danger'}
    sub="Actual minus expected"
  />
</div>

<Card class="mt-4">
  <SectionHeader title="Supply over time" />
  <ul class="mt-3 flex flex-col gap-2.5">
    {#each supplyByMonth as m (m.month)}
      <li class="flex items-center gap-3">
        <span class="w-24 shrink-0 text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
          {formatMonth(m.month)}
        </span>
        <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-(--color-elevated)">
          <span class="block h-full rounded-full bg-gradient-karma" style="width:{(m.supply / maxSupply) * 100}%"></span>
        </span>
        <span class="w-14 shrink-0 text-right text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
          {m.supply}
        </span>
        <span
          class="w-14 shrink-0 text-right text-[0.75rem] tabular-nums {m.net < 0
            ? 'text-(--color-danger)'
            : 'text-(--color-emerald)'}"
        >
          {m.net > 0 ? '+' : ''}{m.net}
        </span>
      </li>
    {/each}
  </ul>
</Card>

<SectionHeader title="All transactions" subtitle="{karmaLedger.length} rows." class="mt-6" />

<div class="mt-2 flex flex-col gap-3 sm:flex-row">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)" />
    <input
      type="search"
      bind:value={query}
      placeholder="Search entries or account ids…"
      aria-label="Search ledger"
      class="w-full rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-2.5 pr-4 pl-10 text-[0.875rem] text-(--color-ink) outline-none placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
    />
  </div>
  <Select
    options={[
      { value: 'all', label: 'All reasons' },
      { value: 'joining_grant', label: 'Joining grant' },
      { value: 'teach', label: 'Teach' },
      { value: 'learn', label: 'Learn' },
      { value: 'redemption', label: 'Redemption' }
    ]}
    bind:value={reason}
    class="sm:w-52"
  />
</div>

<Table {columns} {rows} rowKey={(t) => t.id} caption="Karma ledger" empty="No entries match." class="mt-4">
  {#snippet cell(t: KarmaTransaction, key: string)}
    {#if key === 'title'}
      <span class="font-semibold text-(--color-ink)">{t.title}</span>
    {:else if key === 'user'}
      <a href="/users/{t.userId}" class="font-mono text-[0.75rem] hover:underline">{t.userId}</a>
    {:else if key === 'peer'}
      {t.peerName}
    {:else if key === 'reason'}
      <span class="text-[0.75rem] text-(--color-ink-muted)">{t.reason.replace(/_/g, ' ')}</span>
    {:else if key === 'date'}
      {formatDate(t.timestamp)}
    {:else if key === 'amount'}
      <KarmaBadge amount={t.amount} size="sm" glow={false} signed />
    {/if}
  {/snippet}
</Table>

{#if filtered.length > PER}
  <Pagination bind:page total={filtered.length} perPage={PER} label="entries" class="mt-4" />
{/if}
