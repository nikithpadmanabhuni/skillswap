<script lang="ts">
  import { Gift, Plus } from 'lucide-svelte';
  import { Badge, Button, Card, StatTile, Table, type Column } from '$shared/components/ui';
  import { EmptyState, KarmaBadge, SectionHeader } from '$shared/components/domain';
  import { perks, redemptions } from '$shared/mock';
  import type { CampusPerk } from '$shared/types';

  const catalogue = [...perks].sort((a, b) => a.karmaCost - b.karmaCost);
  const redemptionCount = (id: string) => redemptions.filter((r) => r.perkId === id).length;

  const columns: Column<CampusPerk>[] = [
    { key: 'title', header: 'Perk' },
    { key: 'vendor', header: 'Vendor' },
    { key: 'category', header: 'Category' },
    { key: 'cost', header: 'Cost', numeric: true },
    { key: 'redeemed', header: 'Redeemed', numeric: true },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '' }
  ];

  const totalSunk = redemptions.reduce((s, r) => s + r.karmaCost, 0);
</script>

<svelte:head><title>Perks · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Perks" level={1} subtitle="The only Karma sink. Every redemption removes currency permanently.">
  {#snippet action()}
    <Button size="sm" href="/perks/new"><Plus /> New perk</Button>
  {/snippet}
</SectionHeader>

<div class="mt-3 grid gap-3 sm:grid-cols-3">
  <StatTile label="Active perks" value={perks.filter((p) => p.active).length} tone="brand" />
  <StatTile label="Redemptions" value={redemptions.length} tone="karma" />
  <StatTile label="Karma removed" value={totalSunk} tone="emerald" sub="Withdrawn from circulation" />
</div>

{#if catalogue.length}
  <Table {columns} rows={catalogue} rowKey={(p) => p.id} caption="Perk catalogue" class="mt-4">
    {#snippet cell(p: CampusPerk, key: string)}
      {#if key === 'title'}
        <span class="font-semibold text-(--color-ink)">{p.title}</span>
        <span class="block max-w-72 truncate text-[0.6875rem] text-(--color-ink-muted)">
          {p.description}
        </span>
      {:else if key === 'vendor'}
        {p.vendor}
      {:else if key === 'category'}
        <Badge tone="neutral" size="sm">{p.category}</Badge>
      {:else if key === 'cost'}
        <KarmaBadge amount={p.karmaCost} size="sm" glow={false} />
      {:else if key === 'redeemed'}
        {redemptionCount(p.id)}
      {:else if key === 'status'}
        <Badge tone={p.active ? 'emerald' : 'neutral'} size="sm">
          {p.active ? 'active' : 'archived'}
        </Badge>
      {:else if key === 'actions'}
        <a href="/perks/{p.id}" class="font-bold text-(--color-primary) hover:underline">Edit</a>
      {/if}
    {/snippet}
  </Table>
{:else}
  <Card class="mt-4" padded={false}>
    <EmptyState icon={Gift} title="No perks yet" body="Add the first one so students have somewhere to spend.">
      {#snippet action()}<Button href="/perks/new">Create a perk</Button>{/snippet}
    </EmptyState>
  </Card>
{/if}

<p class="mt-4 text-[0.8125rem] text-(--color-ink-muted)">
  Perks are seeded by a deploy script rather than by client code. In the Flutter app every client
  raced to seed the catalogue on startup.
</p>
