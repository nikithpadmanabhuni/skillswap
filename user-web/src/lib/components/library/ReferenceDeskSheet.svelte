<script lang="ts">
  import {
    Bot,
    Search,
    Send,
    Sparkles,
    BookOpen,
    HelpCircle,
    ChevronRight,
    CornerDownLeft
  } from 'lucide-svelte';
  import { ReferenceDeskService } from '$shared/utils/reference-desk';
  import { Dialog, Button } from '$shared/components/ui';

  let {
    open = $bindable(false)
  }: {
    open: boolean;
  } = $props();

  let query = $state('');
  let messages = $state<Array<{ role: 'user' | 'assistant'; text: string; category?: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your University Reference Desk Assistant. You can ask me about off-campus database access (IEEE Xplore, ScienceDirect), GPU pod bookings, course reserves, wireless printing quotas, or graduation clearance.'
    }
  ]);

  const quickPrompts = [
    'How do I access IEEE Xplore off-campus?',
    'Where are the GPU computing pods?',
    'How does library No-Dues clearance work?',
    'How much is the wireless printing quota?',
    'Can I get Turnitin plagiarism reports?'
  ];

  function sendQuestion(text: string) {
    if (!text.trim()) return;
    const userQ = text.trim();
    messages.push({ role: 'user', text: userQ });
    query = '';

    // Generate intelligent reference answer
    setTimeout(() => {
      const answer = ReferenceDeskService.answerQuery(userQ);
      messages.push({
        role: 'assistant',
        text: answer,
        category: 'Reference Desk Knowledge Base'
      });
    }, 250);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(query);
    }
  }
</script>

<Dialog bind:open title="AI Reference Desk & Campus Gateway" size="lg">
  <div class="space-y-4">
    <!-- Welcome banner -->
    <div class="flex items-center gap-3 rounded-xl border border-(--color-brand)/20 bg-(--color-brand)/5 p-3.5">
      <div class="grid size-10 place-items-center rounded-xl bg-gradient-brand text-white shadow-xs">
        <Sparkles class="size-5" />
      </div>
      <div>
        <p class="text-xs font-bold text-(--color-brand)">University 24/7 Digital Reference Service</p>
        <p class="text-xs text-(--color-ink-secondary)">
          Verified campus policies, proxy settings, research tools & room bookings.
        </p>
      </div>
    </div>

    <!-- Suggested Quick Prompts -->
    <div>
      <p class="mb-1.5 text-[11px] font-bold text-(--color-ink-muted) uppercase tracking-wider">
        Frequently Asked Reference Topics
      </p>
      <div class="flex flex-wrap gap-1.5">
        {#each quickPrompts as prompt}
          <button
            type="button"
            onclick={() => sendQuestion(prompt)}
            class="rounded-lg border border-(--color-line) bg-(--color-elevated) px-2.5 py-1 text-xs text-(--color-ink-secondary) hover:border-(--color-primary) hover:text-(--color-primary) transition active:scale-95"
          >
            {prompt}
          </button>
        {/each}
      </div>
    </div>

    <!-- Conversation Window -->
    <div
      class="flex max-h-[42vh] min-h-[220px] flex-col gap-3 overflow-y-auto rounded-xl border border-(--color-line) bg-(--color-card) p-3.5 shadow-inner"
    >
      {#each messages as msg}
        <div class="flex gap-2.5 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          {#if msg.role === 'assistant'}
            <div class="grid size-7 shrink-0 place-items-center rounded-lg bg-(--color-primary) text-white">
              <Bot class="size-4" />
            </div>
          {/if}

          <div
            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed {msg.role === 'user'
              ? 'bg-(--color-primary) text-white rounded-tr-xs'
              : 'border border-(--color-line) bg-(--color-elevated) text-(--color-ink) rounded-tl-xs'}"
          >
            {#if msg.category}
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-(--color-primary)">
                {msg.category}
              </p>
            {/if}
            <p class="whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Question Input Bar -->
    <div class="relative flex items-center gap-2">
      <input
        type="text"
        placeholder="Ask a question about library services, EZProxy, reserves..."
        bind:value={query}
        onkeydown={handleKeydown}
        class="w-full rounded-xl border border-(--color-line) bg-(--color-card) py-2.5 pl-3.5 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
      />
      <button
        type="button"
        onclick={() => sendQuestion(query)}
        disabled={!query.trim()}
        class="absolute right-2 grid size-7 place-items-center rounded-lg bg-(--color-primary) text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition"
        aria-label="Send question"
      >
        <Send class="size-3.5" />
      </button>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)}>Close Reference Desk</Button>
  {/snippet}
</Dialog>
