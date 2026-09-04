<script lang="ts">
  import type { User } from '../../types';
  import { cn } from '../../utils/cn';
  import Avatar from '../ui/Avatar.svelte';
  import KarmaBadge from './KarmaBadge.svelte';
  import RatingStars from './RatingStars.svelte';

  let {
    user,
    rank,
    metric,
    isMe = false
  }: { user: User; rank: number; metric: 'hours' | 'karma'; isMe?: boolean } = $props();

  // Bronze is #CD7F32 in the Flutter source; gold and silver were never tokens.
  const MEDALS: Record<number, string> = { 1: '#F59E0B', 2: '#94A3B8', 3: '#CD7F32' };
  const medal = $derived(MEDALS[rank]);
</script>

<li
  class={cn(
    'flex items-center gap-3 rounded-[var(--radius-card)] border-[1.2px] px-4 py-3',
    isMe ? 'border-(--color-primary) bg-(--color-primary)/6' : 'border-(--color-line) bg-(--color-card)'
  )}
>
  <span
    class="grid size-8 shrink-0 place-items-center rounded-full text-[0.8125rem] font-black tabular-nums"
    style={medal
      ? `background-color:color-mix(in srgb,${medal} 18%,transparent);color:${medal}`
      : 'background-color:var(--color-elevated);color:var(--color-ink-muted)'}
  >
    {rank}
  </span>
  <Avatar name={user.name} src={user.avatarUrl} size={36} />
  <div class="min-w-0 flex-1">
    <p class="truncate text-[0.9375rem] font-bold text-(--color-ink)">
      <a href="/u/{user.id}" class="hover:underline">{user.name}</a>
      {#if isMe}<span class="ml-1 text-[0.6875rem] font-bold text-(--color-primary)">YOU</span>{/if}
    </p>
    <div class="mt-0.5 flex items-center gap-2">
      <RatingStars rating={user.rating} size={12} />
      <span class="truncate text-[0.75rem] text-(--color-ink-muted)">{user.major}</span>
    </div>
  </div>
  {#if metric === 'karma'}
    <KarmaBadge amount={user.karmaBalance} size="sm" glow={false} />
  {:else}
    <span class="text-[0.9375rem] font-black tabular-nums text-(--color-ink)">
      {user.hoursTaught}<span class="ml-0.5 text-[0.75rem] font-bold text-(--color-ink-muted)">h</span>
    </span>
  {/if}
</li>
