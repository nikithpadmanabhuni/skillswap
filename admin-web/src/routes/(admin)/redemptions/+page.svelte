<script lang="ts">
  import { Check, Search, Ticket } from 'lucide-svelte';
  import { Badge, Button, Card, Select, StatTile, Table, Tabs, toasts, type Column } from '$shared/components/ui';
  import { EmptyState, KarmaBadge, SectionHeader } from '$shared/components/domain';
  import { perks, redemptions } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';
  import type { Redemption } from '$shared/types';

  // Local overrides so "mark honoured" is demonstrable.
  let honoured = $state<string[]>([]);
  const statusOf = (r: Redemption): Redemption['status'] =>
    honoured.includes(r.id) ? 'honoured' : r.status;

  let filter = $state<'all' | 'issued' | 'honoured' | 'expired'>('issued');
  let vendor = $state('all');
  let query = $state('');

  const vendors = [...new Set(perks.map((p) => p.vendor))].sort();

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return redemptions.filter((r) => {
      if (filter !== 'all' && statusOf(r) !== filter) return false;
      if (vendor !== 'all') {
        const p = perks.find((x) => x.id === r.perkId);
        if (p?.vendor !== vendor) return false;
      }
      if (!q) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.perkTitle.toLowerCase().includes(q)
      );
    });
  });

  const counts = $derived({
    issued: redemptions.filter((r) => statusOf(r) === 'issued').length,
    honoured: redemptions.filter((r) => statusOf(r) === 'honoured').length,
    expired: redemptions.filter((r) => statusOf(r) === 'expired').length
  });

  const columns: Column<Redemption>[] = [
    { key: 'code', header: 'Code' },
    { key: 'perk', header: 'Perk' },
    { key: 'user', header: 'Student' },
    { key: 'issued', header: 'Issued' },
    { key: 'cost', header: 'Karma', numeric: true },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '' }
  ];
</script>

<svelte:head><title>Redemptions · SkillSwap Admin</title></svelte:head>

<SectionHeader
  title="Redemptions" level={1}
  subtitle="Vendor-verifiable codes. This is where a café confirms one was honoured."
/>

<Card class="mt-3 flex items-start gap-3">
  <Ticket class="mt-0.5 size-[18px] shrink-0 text-(--color-primary)" />
  <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">
    The Flutter app debited a student's Karma and produced nothing anyone could honour — no voucher,
    no code, no record. A redemption is only a real feature if the vendor on the other side can
    check it, which is what this screen is for.
  </p>
</Card>

<div class="mt-4 grid gap-3 sm:grid-cols-3">
  <StatTile label="Outstanding" value={counts.issued} tone="karma" sub="Issued, not yet honoured" />
  <StatTile label="Honoured" value={counts.honoured} tone="emerald" />
  <StatTile label="Expired" value={counts.expired} tone="neutral" />
</div>

<Tabs
  tabs={[
    { value: 'issued', label: 'Outstanding', count: counts.issued },
    { value: 'honoured', label: 'Honoured', count: counts.honoured },
    { value: 'expired', label: 'Expired', count: counts.expired },
    { value: 'all', label: 'All', count: redemptions.length }
  ]}
  bind:value={filter}
  class="mt-4"
/>

<div id="panel-{filter}" role="tabpanel" aria-labelledby="tab-{filter}" tabindex="-1">
  <div class="mt-3 flex flex-col gap-3 sm:flex-row">
    <div class="relative flex-1">
      <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)" />
      <input
        type="search"
        bind:value={query}
        placeholder="Scan or type a code…"
        aria-label="Search redemption codes"
        class="w-full rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-2.5 pr-4 pl-10 font-mono text-[0.875rem] text-(--color-ink) outline-none placeholder:font-sans placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
      />
    </div>
    <Select
      options={[{ value: 'all', label: 'All vendors' }, ...vendors.map((v) => ({ value: v, label: v }))]}
      bind:value={vendor}
      class="sm:w-60"
    />
  </div>

  {#if filtered.length}
    <Table columns={columns} rows={filtered} rowKey={(r) => r.id} caption="Redemptions" class="mt-4">
      {#snippet cell(r: Redemption, key: string)}
        {#if key === 'code'}
          <span class="font-mono font-bold tracking-wide text-(--color-ink)">{r.code}</span>
        {:else if key === 'perk'}
          {r.perkTitle}
        {:else if key === 'user'}
          <a href="/users/{r.userId}" class="hover:underline">{r.userName}</a>
        {:else if key === 'issued'}
          {formatDate(r.createdAt)}
        {:else if key === 'cost'}
          <KarmaBadge amount={r.karmaCost} size="sm" glow={false} />
        {:else if key === 'status'}
          {@const s = statusOf(r)}
          <Badge tone={s === 'honoured' ? 'emerald' : s === 'issued' ? 'karma' : 'neutral'} size="sm">
            {s}
          </Badge>
        {:else if key === 'actions'}
          {#if statusOf(r) === 'issued'}
            <Button
              size="sm"
              variant="outline"
              onclick={() => {
                // TODO: convert to a form action (POST /redemptions/[id]/honour).
                honoured = [...honoured, r.id];
                toasts.success(`${r.code} marked honoured.`);
              }}
            >
              <Check /> Mark honoured
            </Button>
          {/if}
        {/if}
      {/snippet}
    </Table>
  {:else}
    <Card class="mt-4" padded={false}>
      <EmptyState icon={Ticket} title="Nothing here" body="No redemptions match those filters." />
    </Card>
  {/if}
</div>
