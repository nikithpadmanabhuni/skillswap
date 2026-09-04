<script lang="ts">
  import { CalendarDays, Clock, MapPin } from 'lucide-svelte';
  import type { Session } from '../../types';
  import Card from '../ui/Card.svelte';
  import KarmaBadge from './KarmaBadge.svelte';
  import SessionStatusPill from './SessionStatusPill.svelte';
  import { formatDate, formatTime } from '../../utils/format';

  let { session, perspective }: { session: Session; perspective: 'teaching' | 'learning' } =
    $props();

  const counterpart = $derived(
    perspective === 'teaching' ? session.studentName : session.teacherName
  );
</script>

<Card interactive class="relative flex flex-col gap-3">
  <!--
    The status pill sits on its own row rather than beside the title. Sharing a
    row, a long label like "Pending approval" took most of a two-column card and
    truncated "Film Photography" to "Film P...". The title gets the full width.
  -->
  <div class="flex flex-col gap-1.5">
    <h3 class="text-title-md text-(--color-ink)">
      <a href="/sessions/{session.id}" class="after:absolute after:inset-0 hover:underline">
        {session.requestedSkillTitle}
      </a>
    </h3>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="min-w-0 flex-1 truncate text-body-md text-(--color-ink-muted)">
        {perspective === 'teaching' ? 'Teaching' : 'Learning from'}
        {counterpart}
      </p>
      <SessionStatusPill status={session.status} size="sm" />
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.75rem] text-(--color-ink-muted)">
    {#if session.scheduledDateTime}
      <span class="inline-flex items-center gap-1.5">
        <CalendarDays class="size-3.5" />{formatDate(session.scheduledDateTime)}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <Clock class="size-3.5" />{formatTime(session.scheduledDateTime)}
      </span>
    {:else}
      <span class="inline-flex items-center gap-1.5 italic">
        <CalendarDays class="size-3.5" />No time agreed yet
      </span>
    {/if}
    {#if session.location}
      <span class="inline-flex min-w-0 items-center gap-1.5">
        <MapPin class="size-3.5 shrink-0" /><span class="truncate">{session.location}</span>
      </span>
    {/if}
  </div>

  <div class="flex items-center justify-between gap-3 border-t-[1.2px] border-(--color-line) pt-3">
    <span class="text-[0.75rem] font-semibold text-(--color-ink-muted)">
      {session.durationHours}h
      {#if session.offeredSkillTitle}· swap for {session.offeredSkillTitle}{/if}
    </span>
    <KarmaBadge
      amount={perspective === 'teaching' ? session.karmaAmount : -session.karmaAmount}
      size="sm"
      glow={false}
      signed
    />
  </div>
</Card>
