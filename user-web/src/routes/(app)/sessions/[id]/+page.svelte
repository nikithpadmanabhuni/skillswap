<script lang="ts">
  import {
    ArrowLeft,
    CalendarClock,
    Check,
    MapPin,
    MessageSquare,
    Star,
    Video,
    X
  } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Button, Card, Dialog, Input, toasts } from '$shared/components/ui';
  import { KarmaBadge, SessionStatusPill } from '$shared/components/domain';
  import { CURRENT_USER_ID, getProfile, sessions } from '$shared/mock';
  import { formatDateFull, formatTime } from '$shared/utils/format';
  import type { SessionStatus } from '$shared/types';

  const session = $derived(sessions.find((s) => s.id === page.params.id));
  const isTeacher = $derived(session?.providerId === CURRENT_USER_ID);
  const peerId = $derived(isTeacher ? session?.requesterId : session?.providerId);
  const peer = $derived(peerId ? getProfile(peerId) : undefined);

  // Local echo of the status so the transitions are demonstrable. TODO: each of
  // these becomes a form action; the real transition is a server write.
  let status = $state<SessionStatus | null>(null);
  const current = $derived(status ?? session?.status ?? 'pending');

  let scheduleOpen = $state(false);
  let when = $state('');
  let where = $state('');

  $effect(() => {
    if (session) {
      when = session.scheduledDateTime?.slice(0, 16) ?? '';
      where = session.location;
    }
  });

  function transition(next: SessionStatus, message: string) {
    status = next;
    toasts.success(message);
  }

  const canAccept = $derived(current === 'pending' && isTeacher);
  const canSchedule = $derived(current === 'accepted' || current === 'scheduled');
  const canComplete = $derived(current === 'scheduled');
  const canReview = $derived(current === 'completed');
</script>

<svelte:head><title>{session?.requestedSkillTitle ?? 'Session'} · SkillSwap Campus</title></svelte:head>

{#if !session || !peer}
  <Card class="text-center">
    <p class="text-body-lg">That session does not exist.</p>
    <Button href="/sessions" variant="outline" class="mt-4">Back to sessions</Button>
  </Card>
{:else}
  <a
    href="/sessions"
    class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
  >
    <ArrowLeft class="size-4" /> Sessions
  </a>

  <div class="grid gap-4 lg:grid-cols-[1fr_20rem]">
    <div class="flex flex-col gap-4">
      <Card class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-display leading-tight text-(--color-ink)">
              {session.requestedSkillTitle}
            </h1>
            <p class="mt-1 text-body-lg text-(--color-ink-secondary)">
              {isTeacher ? 'You are teaching' : 'You are learning from'}
              <a href="/u/{peer.id}" class="font-bold hover:underline">{peer.name}</a>
            </p>
          </div>
          <SessionStatusPill status={current} />
        </div>

        {#if session.offeredSkillTitle}
          <p class="text-body-md text-(--color-ink-secondary)">
            Mutual swap — in return, {isTeacher ? 'they teach you' : 'you teach them'}
            <strong class="font-bold text-(--color-ink)">{session.offeredSkillTitle}</strong>.
          </p>
        {/if}

        <dl class="grid gap-3 border-t-[1.2px] border-(--color-line) pt-4 sm:grid-cols-2">
          <div class="flex items-start gap-2.5">
            <CalendarClock class="mt-0.5 size-4 shrink-0 text-(--color-ink-muted)" />
            <div>
              <dt class="text-[0.6875rem] font-bold text-(--color-ink-muted) uppercase">When</dt>
              <dd class="text-[0.875rem] font-semibold text-(--color-ink)">
                {#if session.scheduledDateTime}
                  {formatDateFull(session.scheduledDateTime)} at {formatTime(session.scheduledDateTime)}
                {:else}
                  Not agreed yet
                {/if}
              </dd>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <MapPin class="mt-0.5 size-4 shrink-0 text-(--color-ink-muted)" />
            <div>
              <dt class="text-[0.6875rem] font-bold text-(--color-ink-muted) uppercase">Where</dt>
              <dd class="text-[0.875rem] font-semibold text-(--color-ink)">
                {session.location || 'Not agreed yet'}
              </dd>
            </div>
          </div>
        </dl>

        {#if session.notes}
          <div class="rounded-[var(--radius-input)] bg-(--color-elevated)/60 p-3.5">
            <p class="text-[0.6875rem] font-bold text-(--color-ink-muted) uppercase">Notes</p>
            <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-secondary)">
              {session.notes}
            </p>
          </div>
        {/if}
      </Card>

      <Card class="flex flex-wrap gap-2">
        {#if canAccept}
          <Button onclick={() => transition('accepted', 'Accepted. Agree a time next.')}>
            <Check /> Accept
          </Button>
          <Button
            variant="outline"
            onclick={() => transition('declined', 'Declined. They have been told.')}
          >
            <X /> Decline
          </Button>
        {/if}
        {#if canSchedule}
          <Button variant={current === 'scheduled' ? 'outline' : 'primary'} onclick={() => (scheduleOpen = true)}>
            <CalendarClock />
            {current === 'scheduled' ? 'Reschedule' : 'Set a time'}
          </Button>
        {/if}
        {#if canComplete}
          <Button onclick={() => transition('completed', 'Marked complete. A review settles the Karma.')}>
            <Check /> Mark complete
          </Button>
        {/if}
        {#if canReview}
          <Button href="/sessions/{session.id}/review"><Star /> Leave a review</Button>
        {/if}
        <Button variant="outline" href="/messages/{session.id}"><MessageSquare /> Message</Button>
        <Button variant="ghost" href="/sessions/{session.id}/call"><Video /> Video call</Button>
        {#if !['reviewed', 'declined'].includes(current)}
          <Button
            variant="ghost"
            class="text-(--color-danger)"
            onclick={() => transition('declined', 'Session cancelled.')}
          >
            Cancel session
          </Button>
        {/if}
      </Card>
    </div>

    <aside class="flex flex-col gap-4">
      <Card class="flex flex-col items-center gap-3 text-center">
        <Avatar name={peer.name} src={peer.avatarUrl} size={64} />
        <div>
          <a href="/u/{peer.id}" class="text-title-md text-(--color-ink) hover:underline">
            {peer.name}
          </a>
          <p class="text-body-md text-(--color-ink-muted)">{peer.major}</p>
        </div>
        <Button variant="outline" size="sm" full href="/u/{peer.id}">View profile</Button>
      </Card>

      <Card class="flex flex-col gap-3">
        <p class="text-[0.6875rem] font-bold text-(--color-ink-muted) uppercase">Karma</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-body-md text-(--color-ink-secondary)">
            {isTeacher ? 'You earn' : 'You spend'}
          </span>
          <KarmaBadge
            amount={isTeacher ? session.karmaAmount : -session.karmaAmount}
            size="sm"
            glow={false}
            signed
          />
        </div>
        <p class="text-[0.75rem] leading-snug text-(--color-ink-muted)">
          Karma settles when the review is submitted, not when the session is scheduled. Duration
          {session.durationHours}h.
        </p>
      </Card>
    </aside>
  </div>

  <Dialog bind:open={scheduleOpen} title="Set a time and place">
    <div class="flex flex-col gap-4">
      <Input label="When" type="datetime-local" bind:value={when} />
      <Input label="Where" bind:value={where} placeholder="Library, Group Room 3" />
    </div>
    {#snippet footer()}
      <Button variant="outline" onclick={() => (scheduleOpen = false)}>Cancel</Button>
      <Button
        onclick={() => {
          // TODO: form action. Posts a system message into the thread (spec 3.7).
          scheduleOpen = false;
          transition('scheduled', 'Scheduled. A system message was posted to the thread.');
        }}
      >
        Save
      </Button>
    {/snippet}
  </Dialog>
{/if}
