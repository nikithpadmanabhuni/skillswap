<script lang="ts">
  import { CalendarPlus, CalendarRange, LayoutList } from 'lucide-svelte';
  import { Button, Card, Dialog, Input, Select, Tabs, Textarea, toasts } from '$shared/components/ui';
  import { EmptyState, SectionHeader, SessionCard } from '$shared/components/domain';
  import { SESSION_STATUSES, STATUS_LABELS, type SessionStatus } from '$shared/types';
  import { CURRENT_USER_ID, peers, sessions } from '$shared/mock';
  import { formatDate, formatTime } from '$shared/utils/format';

  const mine = $derived(
    sessions.filter((s) => s.requesterId === CURRENT_USER_ID || s.providerId === CURRENT_USER_ID)
  );

  // Live sessions first; the settled back-history would otherwise bury them.
  const LIVE: SessionStatus[] = ['pending', 'accepted', 'scheduled', 'completed'];
  const live = $derived(mine.filter((s) => LIVE.includes(s.status)));

  let view = $state<'list' | 'calendar'>('list');
  let filter = $state<SessionStatus | 'live'>('live');
  let createOpen = $state(false);

  const shown = $derived(filter === 'live' ? live : mine.filter((s) => s.status === filter));

  const tabs = $derived([
    { value: 'live', label: 'Active', count: live.length },
    ...SESSION_STATUSES.map((s) => ({
      value: s,
      label: STATUS_LABELS[s],
      count: mine.filter((x) => x.status === s).length
    }))
  ]);

  // Calendar view: only sessions with a time, grouped by day (spec 3.1).
  const byDay = $derived.by(() => {
    const groups = new Map<string, typeof shown>();
    for (const s of shown) {
      if (!s.scheduledDateTime) continue;
      const day = s.scheduledDateTime.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), s]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  });

  const perspective = (s: (typeof mine)[number]) =>
    s.providerId === CURRENT_USER_ID ? ('teaching' as const) : ('learning' as const);

  let newPeer = $state(peers[0]?.id ?? '');
  let newSkill = $state('');
  let newWhen = $state('');
  let newWhere = $state('');
  let newNotes = $state('');
</script>

<svelte:head><title>Sessions · SkillSwap Campus</title></svelte:head>

<SectionHeader title="Sessions" subtitle="{live.length} active, {mine.length} in total.">
  {#snippet action()}
    <div class="flex gap-2">
      <div class="flex rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) p-0.5">
        <button
          type="button"
          onclick={() => (view = 'list')}
          aria-pressed={view === 'list'}
          aria-label="List view"
          class="grid size-8 place-items-center rounded-[10px] {view === 'list'
            ? 'bg-(--color-primary) text-white'
            : 'text-(--color-ink-muted)'}"
        >
          <LayoutList class="size-4" />
        </button>
        <button
          type="button"
          onclick={() => (view = 'calendar')}
          aria-pressed={view === 'calendar'}
          aria-label="Calendar view"
          class="grid size-8 place-items-center rounded-[10px] {view === 'calendar'
            ? 'bg-(--color-primary) text-white'
            : 'text-(--color-ink-muted)'}"
        >
          <CalendarRange class="size-4" />
        </button>
      </div>
      <Button size="sm" onclick={() => (createOpen = true)}><CalendarPlus /> New</Button>
    </div>
  {/snippet}
</SectionHeader>

<Tabs {tabs} bind:value={filter} class="mt-3" />

<div id="panel-{filter}" role="tabpanel" aria-labelledby="tab-{filter}" tabindex="-1" class="mt-4">
  {#if !shown.length}
    <Card padded={false}>
      <EmptyState
        icon={CalendarRange}
        title="Nothing here"
        body="No sessions with that status. Find someone to trade with and propose a swap."
      >
        {#snippet action()}<Button href="/explore">Explore matches</Button>{/snippet}
      </EmptyState>
    </Card>
  {:else if view === 'list'}
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each shown as s (s.id)}
        <SessionCard session={s} perspective={perspective(s)} />
      {/each}
    </div>
  {:else}
    <div class="flex flex-col gap-5">
      {#each byDay as [day, group] (day)}
        <section>
          <h3 class="mb-2 text-title-sm text-(--color-ink-secondary)">
            {formatDate(`${day}T12:00:00.000Z`)}
          </h3>
          <ul class="flex flex-col gap-2">
            {#each group as s (s.id)}
              <li>
                <a
                  href="/sessions/{s.id}"
                  class="flex items-center gap-3 rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) px-4 py-3 hover:bg-(--color-elevated)/50"
                >
                  <span class="w-14 shrink-0 text-[0.8125rem] font-bold tabular-nums text-(--color-primary)">
                    {s.scheduledDateTime ? formatTime(s.scheduledDateTime) : '—'}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-[0.9375rem] font-bold text-(--color-ink)">
                      {s.requestedSkillTitle}
                    </span>
                    <span class="block truncate text-[0.75rem] text-(--color-ink-muted)">
                      {perspective(s) === 'teaching' ? s.studentName : s.teacherName} · {s.location}
                    </span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {:else}
        <Card padded={false}>
          <EmptyState
            icon={CalendarRange}
            title="Nothing scheduled"
            body="Sessions appear here once a date and time are agreed."
          />
        </Card>
      {/each}
    </div>
  {/if}
</div>

<Dialog
  bind:open={createOpen}
  title="Create a session"
  description="For swaps arranged in person. Both of you still confirm before it counts."
>
  <div class="flex flex-col gap-4">
    <Select
      label="With"
      options={peers.map((p) => ({ value: p.id, label: `${p.name} — ${p.major}` }))}
      bind:value={newPeer}
    />
    <Input label="Skill" bind:value={newSkill} placeholder="What is being taught?" />
    <div class="grid gap-4 sm:grid-cols-2">
      <Input label="When" type="datetime-local" bind:value={newWhen} />
      <Input label="Where" bind:value={newWhere} placeholder="Library, Group Room 3" />
    </div>
    <Textarea label="Notes" bind:value={newNotes} rows={2} />
  </div>
  {#snippet footer()}
    <Button variant="outline" onclick={() => (createOpen = false)}>Cancel</Button>
    <Button
      onclick={() => {
        // TODO: convert to a form action (POST /sessions).
        createOpen = false;
        toasts.success('Session created and a chat thread opened.');
      }}
    >
      Create session
    </Button>
  {/snippet}
</Dialog>
