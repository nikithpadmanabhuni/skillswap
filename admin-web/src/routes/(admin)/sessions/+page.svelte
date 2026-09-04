<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { Pagination, Select, StatTile, Table, type Column } from '$shared/components/ui';
  import { KarmaBadge, SectionHeader, SessionStatusPill } from '$shared/components/domain';
  import { sessionFunnel, sessions } from '$shared/mock';
  import { SESSION_STATUSES, STATUS_LABELS, type Session } from '$shared/types';
  import { formatDate } from '$shared/utils/format';

  let query = $state('');
  let status = $state('all');
  let page = $state(1);
  const PER = 20;

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (!q) return true;
      return (
        s.requestedSkillTitle.toLowerCase().includes(q) ||
        s.teacherName.toLowerCase().includes(q) ||
        s.studentName.toLowerCase().includes(q)
      );
    });
  });

  $effect(() => {
    void query;
    void status;
    page = 1;
  });

  const rows = $derived(filtered.slice((page - 1) * PER, page * PER));

  const columns: Column<Session>[] = [
    { key: 'skill', header: 'Skill' },
    { key: 'teacher', header: 'Teacher' },
    { key: 'student', header: 'Student' },
    { key: 'date', header: 'Date' },
    { key: 'location', header: 'Location' },
    { key: 'karma', header: 'Karma', numeric: true },
    { key: 'status', header: 'Status' }
  ];

  const settled = sessionFunnel.find((f) => f.status === 'reviewed')?.count ?? 0;
  const declined = sessionFunnel.find((f) => f.status === 'declined')?.count ?? 0;
</script>

<svelte:head><title>Sessions · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Sessions" subtitle="Every session on the platform." />

<div class="mt-3 grid gap-3 sm:grid-cols-4">
  <StatTile label="Total" value={sessions.length} />
  <StatTile label="Settled" value={settled} tone="emerald" sub="Karma has moved" />
  <StatTile label="In flight" value={sessions.length - settled - declined} tone="brand" />
  <StatTile label="Declined" value={declined} tone="danger" />
</div>

<div class="mt-4 flex flex-col gap-3 sm:flex-row">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)" />
    <input
      type="search"
      bind:value={query}
      placeholder="Search skill, teacher or student…"
      aria-label="Search sessions"
      class="w-full rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-2.5 pr-4 pl-10 text-[0.875rem] text-(--color-ink) outline-none placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
    />
  </div>
  <Select
    options={[
      { value: 'all', label: 'All statuses' },
      ...SESSION_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))
    ]}
    bind:value={status}
    class="sm:w-52"
  />
</div>

<Table {columns} {rows} rowKey={(s) => s.id} caption="All sessions" empty="No sessions match." class="mt-4">
  {#snippet cell(s: Session, key: string)}
    {#if key === 'skill'}
      <span class="font-semibold text-(--color-ink)">{s.requestedSkillTitle}</span>
      {#if s.offeredSkillTitle}
        <span class="block text-[0.6875rem] text-(--color-ink-muted)">
          swap for {s.offeredSkillTitle}
        </span>
      {/if}
    {:else if key === 'teacher'}
      <a href="/users/{s.providerId}" class="hover:underline">{s.teacherName}</a>
    {:else if key === 'student'}
      <a href="/users/{s.requesterId}" class="hover:underline">{s.studentName}</a>
    {:else if key === 'date'}
      {s.scheduledDateTime ? formatDate(s.scheduledDateTime) : '—'}
    {:else if key === 'location'}
      <span class="block max-w-48 truncate">{s.location || '—'}</span>
    {:else if key === 'karma'}
      <KarmaBadge amount={s.karmaAmount} size="sm" glow={false} />
    {:else if key === 'status'}
      <SessionStatusPill status={s.status} size="sm" />
    {/if}
  {/snippet}
</Table>

{#if filtered.length > PER}
  <Pagination bind:page total={filtered.length} perPage={PER} label="sessions" class="mt-4" />
{/if}
