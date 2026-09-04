<script lang="ts">
  import { ArrowLeft, Info, Send } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Button, Card } from '$shared/components/ui';
  import { MessageBubble, SessionStatusPill } from '$shared/components/domain';
  import { CURRENT_USER_ID, getProfile, sessions, threadFrom } from '$shared/mock';
  import type { ChatMessage } from '$shared/types';

  const session = $derived(sessions.find((s) => s.id === page.params.sessionId));
  const peerId = $derived(
    session?.providerId === CURRENT_USER_ID ? session?.requesterId : session?.providerId
  );
  const peer = $derived(peerId ? getProfile(peerId) : undefined);

  // Base thread from the fixtures, plus anything sent in this session.
  let sent = $state<ChatMessage[]>([]);
  const thread = $derived([...threadFrom(page.params.sessionId ?? ''), ...sent]);

  let draft = $state('');
  let list = $state<HTMLElement | null>(null);

  // Follow the conversation as it grows, the way a chat client should.
  $effect(() => {
    void thread.length;
    queueMicrotask(() => list?.scrollTo({ top: list.scrollHeight }));
  });

  // TODO: convert to a form action. In the real build this writes to Firestore
  // and the thread updates through a client listener scoped to participants
  // (spec 3.8) — the SSR shell stays server-rendered, only the stream is CSR.
  function send(e: SubmitEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sent = [
      ...sent,
      {
        id: `local-${sent.length}`,
        sessionId: session?.id ?? '',
        senderId: CURRENT_USER_ID,
        senderName: 'You',
        text,
        // A locally-composed message is the one place a real clock is correct.
        timestamp: new Date().toISOString(),
        isSystemEvent: false
      }
    ];
    draft = '';
  }
</script>

<svelte:head><title>{peer?.name ?? 'Thread'} · Messages</title></svelte:head>

{#if !session || !peer}
  <Card class="text-center">
    <p class="text-body-lg">That conversation does not exist.</p>
    <Button href="/messages" variant="outline" class="mt-4">Back to messages</Button>
  </Card>
{:else}
  <div class="flex h-[calc(100dvh-11rem)] flex-col md:h-[calc(100dvh-9rem)]">
    <header
      class="flex items-center gap-3 rounded-t-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-3"
    >
      <a
        href="/messages"
        class="grid size-9 shrink-0 place-items-center rounded-full text-(--color-ink-muted) hover:bg-(--color-elevated)"
        aria-label="Back to messages"
      >
        <ArrowLeft class="size-[18px]" />
      </a>
      <Avatar name={peer.name} src={peer.avatarUrl} size={38} />
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-title-sm text-(--color-ink)">
          <a href="/u/{peer.id}" class="hover:underline">{peer.name}</a>
        </h1>
        <p class="truncate text-[0.75rem] text-(--color-ink-muted)">
          {session.requestedSkillTitle}
        </p>
      </div>
      <SessionStatusPill status={session.status} size="sm" />
      <Button variant="ghost" size="icon-sm" href="/sessions/{session.id}" aria-label="Session details">
        <Info />
      </Button>
    </header>

    <div
      bind:this={list}
      class="flex-1 overflow-y-auto border-x-[1.2px] border-(--color-line) bg-(--color-bg) p-4"
    >
      <ul class="flex flex-col gap-3">
        {#each thread as message (message.id)}
          <MessageBubble {message} isMine={message.senderId === CURRENT_USER_ID} />
        {/each}
      </ul>
    </div>

    <form
      onsubmit={send}
      class="flex gap-2 rounded-b-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-3"
    >
      <label for="msg" class="sr-only">Message {peer.name}</label>
      <input
        id="msg"
        bind:value={draft}
        placeholder="Write a message…"
        autocomplete="off"
        class="flex-1 rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-bg) px-4 py-2.5 text-[0.9375rem] text-(--color-ink) outline-none placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
      />
      <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message">
        <Send />
      </Button>
    </form>
  </div>
{/if}
