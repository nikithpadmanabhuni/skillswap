<script lang="ts">
  import { Bell, CalendarClock, MessageSquarePlus, Sparkles, Triangle, Zap } from 'lucide-svelte';
  import { Button, Card, Tabs } from '$shared/components/ui';
  import { EmptyState, SectionHeader } from '$shared/components/domain';
  import { NOW, notifications } from '$shared/mock';
  import { formatRelative } from '$shared/utils/format';
  import type { AppNotification } from '$shared/types';

  // Local read state so "mark all read" is demonstrable.
  let readIds = $state<string[]>([]);
  const isRead = (n: AppNotification) => n.read || readIds.includes(n.id);

  let filter = $state<'all' | 'unread'>('all');
  const shown = $derived(filter === 'all' ? notifications : notifications.filter((n) => !isRead(n)));
  const unread = $derived(notifications.filter((n) => !isRead(n)).length);

  const ICONS = {
    session: CalendarClock,
    karma: Zap,
    swap: MessageSquarePlus,
    mesh: Triangle,
    system: Sparkles
  } as const;

  const TONES = {
    session: 'bg-(--color-brand)/14 text-(--color-primary)',
    karma: 'bg-(--color-karma)/14 text-(--color-warning)',
    swap: 'bg-(--color-ocean)/14 text-(--color-ocean)',
    mesh: 'bg-(--color-violet)/14 text-(--color-violet)',
    system: 'bg-(--color-emerald)/14 text-(--color-emerald)'
  } as const;
</script>

<svelte:head><title>Notifications · SkillSwap Campus</title></svelte:head>

<SectionHeader title="Notifications" level={1} subtitle={unread ? `${unread} unread.` : 'All caught up.'}>
  {#snippet action()}
    {#if unread}
      <Button
        size="sm"
        variant="outline"
        onclick={() => (readIds = notifications.map((n) => n.id))}
      >
        Mark all read
      </Button>
    {/if}
  {/snippet}
</SectionHeader>

<Tabs
  tabs={[
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unread }
  ]}
  bind:value={filter}
  class="mt-3"
/>

<div id="panel-{filter}" role="tabpanel" aria-labelledby="tab-{filter}" tabindex="-1" class="mt-3">
  {#if shown.length}
    <ul class="flex flex-col gap-2">
      {#each shown as n (n.id)}
        {@const Icon = ICONS[n.kind]}
        <li>
          <a
            href={n.href ?? '#'}
            onclick={() => (readIds = [...readIds, n.id])}
            class="flex items-start gap-3 rounded-[var(--radius-card)] border-[1.2px] bg-(--color-card) p-4 transition-colors hover:bg-(--color-elevated)/50 {isRead(
              n
            )
              ? 'border-(--color-line)'
              : 'border-(--color-primary)/35'}"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-full {TONES[n.kind]}">
              <Icon class="size-4" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-3">
                <p class="truncate text-[0.875rem] font-bold text-(--color-ink)">{n.title}</p>
                <time datetime={n.timestamp} class="shrink-0 text-[0.6875rem] text-(--color-ink-muted)">
                  {formatRelative(n.timestamp, NOW)}
                </time>
              </div>
              <p class="mt-0.5 text-[0.8125rem] leading-snug text-(--color-ink-secondary)">
                {n.body}
              </p>
            </div>
            {#if !isRead(n)}
              <span class="mt-1.5 size-2.5 shrink-0 rounded-full bg-(--color-primary)">
                <span class="sr-only">Unread</span>
              </span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <Card padded={false}>
      <EmptyState icon={Bell} title="Nothing unread" body="You are all caught up." />
    </Card>
  {/if}
</div>
