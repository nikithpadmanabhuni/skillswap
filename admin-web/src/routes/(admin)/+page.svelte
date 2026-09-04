<script lang="ts">
  import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ShieldAlert,
    Ticket,
    Users,
    Wallet
  } from 'lucide-svelte';
  import { Button, Card, StatTile } from '$shared/components/ui';
  import { SectionHeader } from '$shared/components/domain';
  import {
    categoryDemand,
    karmaHealth,
    openReports,
    sessionFunnel,
    signupsByMonth,
    supplyByMonth,
    topTeachers,
    totals
  } from '$shared/mock';
  import { CATEGORY_LABELS, STATUS_LABELS, type SkillCategory } from '$shared/types';
  import { formatMonth } from '$shared/utils/format';

  const maxFunnel = Math.max(...sessionFunnel.map((f) => f.count), 1);
  const maxSupply = Math.max(...supplyByMonth.map((m) => m.supply), 1);
  const maxCategory = Math.max(...categoryDemand.map((c) => c.offered + c.wanted), 1);
  const maxSignups = Math.max(...signupsByMonth.map((m) => m.count), 1);
</script>

<svelte:head><title>Dashboard · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Dashboard" level={1} subtitle="Northgate University · single campus" />

<div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <StatTile
    label="Students"
    value={totals.users}
    icon={Users}
    tone="brand"
    sub="{totals.activeUsers} active, {totals.suspendedUsers} suspended"
  />
  <StatTile
    label="Karma in circulation"
    value={karmaHealth.totalSupply}
    icon={Wallet}
    tone="karma"
    sub="{karmaHealth.transactionCount} ledger rows"
  />
  <StatTile
    label="Open reports"
    value={openReports.length}
    icon={ShieldAlert}
    tone={openReports.length ? 'danger' : 'emerald'}
    sub={openReports.length ? 'Awaiting a moderator' : 'Queue clear'}
  />
  <StatTile
    label="Vouchers outstanding"
    value={totals.redemptionsIssued}
    icon={Ticket}
    tone="neutral"
    sub="{totals.redemptionsHonoured} honoured to date"
  />
</div>

<!-- Ledger integrity is the headline number, not a footnote: the defect this
     rebuild exists to fix destroyed Karma on every settled session. -->
<Card
  class="mt-4 flex flex-col gap-3 {karmaHealth.balanced
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
    <div class="min-w-0 flex-1">
      <h2 class="text-title-md text-(--color-ink)">
        {karmaHealth.balanced ? 'Ledger balanced' : 'Ledger drift detected'}
      </h2>
      <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-secondary)">
        Supply should equal joining grants minus redemptions. Every teach credit must have a
        matching learn debit, or the currency is being created or destroyed.
      </p>
    </div>
    <Button variant="outline" size="sm" href="/karma">Ledger <ArrowRight /></Button>
  </div>

  <dl class="grid grid-cols-2 gap-3 border-t-[1.2px] border-(--color-line) pt-3 sm:grid-cols-5">
    {#each [['Granted', karmaHealth.grantedTotal], ['Redeemed', `-${karmaHealth.redeemedTotal}`], ['Expected', karmaHealth.expectedSupply], ['Actual', karmaHealth.totalSupply], ['Drift', karmaHealth.drift]] as [label, value] (label)}
      <div>
        <dt class="text-[0.6875rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
          {label}
        </dt>
        <dd
          class="mt-0.5 text-[1.125rem] font-black tabular-nums {label === 'Drift' &&
          karmaHealth.drift !== 0
            ? 'text-(--color-danger)'
            : 'text-(--color-ink)'}"
        >
          {value}
        </dd>
      </div>
    {/each}
  </dl>
</Card>

<div class="mt-6 grid gap-4 lg:grid-cols-2">
  <Card>
    <SectionHeader title="Session funnel" subtitle="How far proposals actually get." />
    <ul class="mt-3 flex flex-col gap-2.5">
      {#each sessionFunnel as row (row.status)}
        <li class="flex items-center gap-3">
          <span class="w-32 shrink-0 text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
            {STATUS_LABELS[row.status]}
          </span>
          <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-(--color-elevated)">
            <span
              class="block h-full rounded-full {row.status === 'declined'
                ? 'bg-(--color-danger)'
                : 'bg-(--color-primary)'}"
              style="width:{(row.count / maxFunnel) * 100}%"
            ></span>
          </span>
          <span class="w-10 shrink-0 text-right text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
            {row.count}
          </span>
        </li>
      {/each}
    </ul>
  </Card>

  <Card>
    <SectionHeader title="Karma supply" subtitle="Running total, by month." />
    <ul class="mt-3 flex flex-col gap-2.5">
      {#each supplyByMonth as m (m.month)}
        <li class="flex items-center gap-3">
          <span class="w-24 shrink-0 text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
            {formatMonth(m.month)}
          </span>
          <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-(--color-elevated)">
            <span
              class="block h-full rounded-full bg-gradient-karma"
              style="width:{(m.supply / maxSupply) * 100}%"
            ></span>
          </span>
          <span class="w-12 shrink-0 text-right text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
            {m.supply}
          </span>
        </li>
      {/each}
    </ul>
    <p class="mt-3 text-[0.75rem] text-(--color-ink-muted)">
      Supply rises only with joining grants and falls only with redemptions. Teaching and learning
      move Karma between students without changing the total.
    </p>
  </Card>

  <Card>
    <SectionHeader title="Skill demand" subtitle="Offered against wanted, per category." />
    <ul class="mt-3 flex flex-col gap-3">
      {#each categoryDemand as c (c.category)}
        <li>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
              {CATEGORY_LABELS[c.category as SkillCategory]}
            </span>
            <span class="text-[0.75rem] tabular-nums text-(--color-ink-muted)">
              {c.offered} offered · {c.wanted} wanted
            </span>
          </div>
          <div class="mt-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-(--color-elevated)">
            <span
              class="block h-full rounded-l-full bg-(--color-emerald)"
              style="width:{(c.offered / maxCategory) * 100}%"
            ></span>
            <span
              class="block h-full rounded-r-full bg-(--color-brand)"
              style="width:{(c.wanted / maxCategory) * 100}%"
            ></span>
          </div>
        </li>
      {/each}
    </ul>
    <p class="mt-3 text-[0.75rem] text-(--color-ink-muted)">
      Categories where wanted outruns offered are where students cannot find a teacher.
    </p>
  </Card>

  <Card>
    <SectionHeader title="Signups" subtitle="New accounts by month." />
    <ul class="mt-3 flex flex-col gap-2.5">
      {#each signupsByMonth as m (m.month)}
        <li class="flex items-center gap-3">
          <span class="w-24 shrink-0 text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
            {formatMonth(m.month)}
          </span>
          <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-(--color-elevated)">
            <span
              class="block h-full rounded-full bg-(--color-ocean)"
              style="width:{(m.count / maxSignups) * 100}%"
            ></span>
          </span>
          <span class="w-10 shrink-0 text-right text-[0.8125rem] font-bold tabular-nums text-(--color-ink)">
            {m.count}
          </span>
        </li>
      {/each}
    </ul>

    <SectionHeader title="Top teachers" class="mt-5" />
    <ol class="mt-1 flex flex-col gap-1.5">
      {#each topTeachers.slice(0, 5) as u, i (u.id)}
        <li class="flex items-center gap-3 text-[0.8125rem]">
          <span class="w-4 shrink-0 font-bold tabular-nums text-(--color-ink-muted)">{i + 1}</span>
          <a href="/users/{u.id}" class="min-w-0 flex-1 truncate font-semibold text-(--color-ink) hover:underline">
            {u.name}
          </a>
          <span class="shrink-0 font-bold tabular-nums text-(--color-ink)">{u.hoursTaught}h</span>
        </li>
      {/each}
    </ol>
  </Card>
</div>
