<script lang="ts">
  import { MessageSquare } from 'lucide-svelte';
  import { Avatar, Button, Card } from '$shared/components/ui';
  import { EmptyState, SectionHeader, SessionStatusPill } from '$shared/components/domain';
  import { NOW, conversationList } from '$shared/mock';
  import { formatRelative } from '$shared/utils/format';

  // One thread per session (spec 3.1). Sorted newest-first by last message.
  const threads = conversationList;
  const unread = threads.filter((t) => t.unread > 0).length;
</script>

<svelte:head><title>Messages · SkillSwap Campus</title></svelte:head>

<SectionHeader
  title="Messages"
  subtitle="{threads.length} threads{unread ? `, ${unread} with something new` : ''}."
/>

{#if threads.length}
  <ul class="mt-4 flex flex-col gap-2">
    {#each threads as t (t.session.id)}
      <li>
        <a
          href="/messages/{t.session.id}"
          class="flex items-start gap-3 rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-4 transition-colors hover:bg-(--color-elevated)/50"
        >
          <Avatar name={t.peerName} size={44} />
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-3">
              <span class="truncate text-[0.9375rem] font-bold text-(--color-ink)">
                {t.peerName}
              </span>
              <time
                datetime={t.last.timestamp}
                class="shrink-0 text-[0.6875rem] text-(--color-ink-muted)"
              >
                {formatRelative(t.last.timestamp, NOW)}
              </time>
            </div>
            <p class="truncate text-[0.8125rem] text-(--color-ink-secondary)">
              {t.session.requestedSkillTitle}
            </p>
            <p
              class="mt-1 truncate text-[0.8125rem] {t.unread
                ? 'font-semibold text-(--color-ink)'
                : 'text-(--color-ink-muted)'}"
            >
              {t.last.isSystemEvent ? '' : `${t.last.senderName.split(' ')[0]}: `}{t.last.text}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-2">
            <SessionStatusPill status={t.session.status} size="sm" />
            {#if t.unread}
              <span class="size-2.5 rounded-full bg-(--color-primary)">
                <span class="sr-only">Unread</span>
              </span>
            {/if}
          </div>
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <Card class="mt-4" padded={false}>
    <EmptyState
      icon={MessageSquare}
      title="No conversations yet"
      body="Every session opens a thread automatically. Propose a swap and one will appear here."
    >
      {#snippet action()}<Button href="/explore">Explore matches</Button>{/snippet}
    </EmptyState>
  </Card>
{/if}
