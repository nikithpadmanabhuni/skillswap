<script lang="ts">
  import type { ChatMessage } from '../../types';
  import { cn } from '../../utils/cn';
  import { formatTime } from '../../utils/format';

  let { message, isMine }: { message: ChatMessage; isMine: boolean } = $props();
</script>

{#if message.isSystemEvent}
  <!-- System events sit centred and unattributed: they are the thread's audit
       trail, posted on every state transition (spec 2.3). -->
  <li class="my-1 flex justify-center">
    <span
      class="rounded-full border-[1.2px] border-(--color-line) bg-(--color-elevated) px-3 py-1 text-center text-[0.6875rem] font-semibold text-(--color-ink-muted)"
    >
      {message.text}
    </span>
  </li>
{:else}
  <li class={cn('flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}>
    {#if !isMine}
      <span class="px-1 text-[0.6875rem] font-bold text-(--color-ink-muted)">
        {message.senderName}
      </span>
    {/if}
    <div
      class={cn(
        'max-w-[min(32rem,82%)] rounded-[var(--radius-input)] px-3.5 py-2.5 text-[0.875rem] leading-relaxed',
        isMine
          ? 'rounded-br-[6px] bg-(--color-primary) text-white'
          : 'rounded-bl-[6px] border-[1.2px] border-(--color-line) bg-(--color-card) text-(--color-ink)'
      )}
    >
      {message.text}
    </div>
    <span class="px-1 text-[0.6875rem] tabular-nums text-(--color-ink-muted)">
      <time datetime={message.timestamp}>{formatTime(message.timestamp)}</time>
    </span>
  </li>
{/if}
