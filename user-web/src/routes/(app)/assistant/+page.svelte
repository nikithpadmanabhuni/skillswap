<script lang="ts">
  import { Bot, Send, User } from 'lucide-svelte';
  import { Button, Card } from '$shared/components/ui';
  import { PrototypeBanner, SectionHeader } from '$shared/components/domain';
  import { currentUser, matches, meshes, getProfile } from '$shared/mock';

  interface Msg {
    id: number;
    from: 'user' | 'bot';
    text: string;
  }

  /**
   * Scripted responses, and the banner says so.
   *
   * The Flutter "SwapBot AI 2.0" was a chain of `if (query.contains("..."))`
   * returning hardcoded strings, presented as an AI assistant (spec 3.2). This
   * is the same mechanism, labelled honestly. Making it real is a server route
   * proxying the Claude API with the user's skills and peers as context,
   * streamed, rate-limited, and never called from the browser (spec task 5.5).
   *
   * The replies at least read from the real fixture data rather than inventing
   * facts, so nothing on screen contradicts the rest of the app.
   */
  const top = matches[0];
  const topPeer = top ? getProfile(top.targetUserId) : undefined;
  const activeMesh = meshes.find((m) => m.status === 'active');

  const SCRIPT: Array<{ match: RegExp; reply: () => string }> = [
    {
      match: /karma|balance|afford/i,
      reply: () =>
        `You are holding ${currentUser.karmaBalance} Karma. Teaching a session earns 10 and learning costs 10, so your balance moves only when a review is submitted. The cheapest perk is 40.`
    },
    {
      match: /match|who|learn|teach me/i,
      reply: () =>
        topPeer
          ? `Your strongest match is ${topPeer.name} at ${top.matchPercentage}%. ${top.reasoning}`
          : 'No matches yet — add a few skills to your profile and they will appear.'
    },
    {
      match: /mesh|triangle|loop|three/i,
      reply: () =>
        activeMesh
          ? `You have an active loop scoring ${activeMesh.synergyScore}%. ${activeMesh.reasoning}`
          : 'No active loops right now. Listing more wanted skills makes a triangle far more likely.'
    },
    {
      match: /session|schedule|book/i,
      reply: () =>
        'A swap goes pending, accepted, scheduled, completed, reviewed. Karma settles on the last step, not when you schedule it.'
    },
    {
      match: /perk|redeem|coffee|voucher/i,
      reply: () =>
        `Perks run from 40 to 100 Karma. With ${currentUser.karmaBalance} you can afford the coffee, print credits, library room and gym pass.`
    }
  ];

  const SUGGESTIONS = [
    'Who should I learn from next?',
    'How much Karma do I have?',
    'Explain the 3-way mesh',
    'What can I redeem?'
  ];

  let messages = $state<Msg[]>([
    {
      id: 0,
      from: 'bot',
      text: `Hello ${currentUser.name.split(' ')[0]}. Ask me about your matches, your Karma, or how a mesh works. My answers come from a short script, not a language model.`
    }
  ]);
  let draft = $state('');
  let list = $state<HTMLElement | null>(null);

  $effect(() => {
    void messages.length;
    queueMicrotask(() => list?.scrollTo({ top: list.scrollHeight }));
  });

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    const hit = SCRIPT.find((s) => s.match.test(q));
    messages = [
      ...messages,
      { id: messages.length, from: 'user', text: q },
      {
        id: messages.length + 1,
        from: 'bot',
        text:
          hit?.reply() ??
          'That one is outside my script. I can answer questions about Karma, matches, the 3-way mesh, sessions, and perks.'
      }
    ];
    draft = '';
  }
</script>

<svelte:head><title>Assistant (prototype) · SkillSwap Campus</title></svelte:head>

<SectionHeader title="Assistant" subtitle="Answers about your matches, Karma and sessions." />

<PrototypeBanner
  what="Assistant"
  detail="Replies come from a small set of scripted patterns, not a language model — there is no API call behind this screen. The figures it quotes are read from your real data."
  class="mt-3"
/>

<Card class="mt-4 flex h-[calc(100dvh-20rem)] min-h-96 flex-col gap-0" padded={false}>
  <div bind:this={list} class="flex-1 overflow-y-auto p-4">
    <ul class="flex flex-col gap-4">
      {#each messages as m (m.id)}
        <li class="flex gap-3 {m.from === 'user' ? 'flex-row-reverse' : ''}">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full {m.from === 'bot'
              ? 'bg-gradient-mesh text-white'
              : 'bg-(--color-primary)/20 text-(--color-primary)'}"
          >
            {#if m.from === 'bot'}<Bot class="size-4" />{:else}<User class="size-4" />{/if}
          </span>
          <div
            class="max-w-[min(36rem,80%)] rounded-[var(--radius-input)] px-4 py-3 text-[0.875rem] leading-relaxed {m.from ===
            'user'
              ? 'bg-(--color-primary) text-white'
              : 'border-[1.2px] border-(--color-line) bg-(--color-bg) text-(--color-ink)'}"
          >
            {m.text}
          </div>
        </li>
      {/each}
    </ul>
  </div>

  <div class="border-t-[1.2px] border-(--color-line) p-3">
    <div class="mb-2 flex flex-wrap gap-2">
      {#each SUGGESTIONS as s (s)}
        <button
          type="button"
          onclick={() => ask(s)}
          class="rounded-full border-[1.2px] border-(--color-line) bg-(--color-card) px-3 py-1.5 text-[0.75rem] font-semibold text-(--color-ink-secondary) hover:bg-(--color-elevated)"
        >
          {s}
        </button>
      {/each}
    </div>

    <form
      onsubmit={(e) => {
        e.preventDefault();
        ask(draft);
      }}
      class="flex gap-2"
    >
      <label for="ask" class="sr-only">Ask the assistant</label>
      <input
        id="ask"
        bind:value={draft}
        placeholder="Ask about your matches, Karma or sessions…"
        autocomplete="off"
        class="flex-1 rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-bg) px-4 py-2.5 text-[0.9375rem] text-(--color-ink) outline-none placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
      />
      <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send"><Send /></Button>
    </form>
  </div>
</Card>
