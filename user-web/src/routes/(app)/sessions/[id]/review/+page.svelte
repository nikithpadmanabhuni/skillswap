<script lang="ts">
  import { ArrowLeft, PartyPopper, Star } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Button, Card, Dialog, Textarea } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { CURRENT_USER_ID, getProfile, sessions } from '$shared/mock';
  import { loadGsap } from '$shared/motion/gsap';

  const session = $derived(sessions.find((s) => s.id === page.params.id));
  const isTeacher = $derived(session?.providerId === CURRENT_USER_ID);
  const peerId = $derived(isTeacher ? session?.requesterId : session?.providerId);
  const peer = $derived(peerId ? getProfile(peerId) : undefined);

  let rating = $state(0);
  let hovered = $state(0);
  let comment = $state('');
  let error = $state('');
  let celebrate = $state(false);
  let burst = $state<HTMLDivElement | null>(null);

  const shown = $derived(hovered || rating);
  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  /**
   * TODO: convert to a form action (POST /sessions/[id]/review).
   *
   * This is where Karma settles (spec 2.3), and in the real build it is a
   * SINGLE server transaction: debit the learner, credit the teacher, write two
   * ledger rows, update the session status — all or nothing. The Flutter app
   * did it as two separate writes, one of which only touched local memory,
   * which destroyed 10 Karma on every completed session (audit P1-1).
   */
  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!rating) return (error = 'Choose a rating from 1 to 5.');
    error = '';
    celebrate = true;
  }

  // Celebration timeline. Skipped entirely under prefers-reduced-motion.
  $effect(() => {
    if (!celebrate || !burst) return;
    let ctx: { revert: () => void } | null = null;
    loadGsap().then((gsap) => {
      if (!gsap || !burst) return;
      ctx = gsap.context(() => {
        gsap
          .timeline()
          .from('[data-spark]', {
            scale: 0,
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(3)'
          })
          .to('[data-spark]', { y: -8, duration: 1.2, ease: 'sine.inOut', stagger: 0.04, repeat: -1, yoyo: true });
      }, burst);
    });
    return () => ctx?.revert();
  });
</script>

<svelte:head><title>Review · SkillSwap Campus</title></svelte:head>

{#if !session || !peer}
  <Card class="text-center">
    <p class="text-body-lg">That session does not exist.</p>
    <Button href="/sessions" variant="outline" class="mt-4">Back to sessions</Button>
  </Card>
{:else}
  <a
    href="/sessions/{session.id}"
    class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
  >
    <ArrowLeft class="size-4" /> Session
  </a>

  <div class="mx-auto max-w-xl">
    <Card class="flex flex-col gap-5">
      <div class="flex items-center gap-3">
        <Avatar name={peer.name} src={peer.avatarUrl} size={48} />
        <div class="min-w-0">
          <h1 class="text-title-lg text-(--color-ink)">How did it go?</h1>
          <p class="truncate text-body-md text-(--color-ink-muted)">
            {session.requestedSkillTitle} with {peer.name}
          </p>
        </div>
      </div>

      <form onsubmit={submit} class="flex flex-col gap-5" novalidate>
        <fieldset class="flex flex-col items-center gap-2">
          <legend class="sr-only">Rating out of 5</legend>
          <div class="flex gap-1">
            {#each [1, 2, 3, 4, 5] as n (n)}
              <button
                type="button"
                onclick={() => (rating = n)}
                onmouseenter={() => (hovered = n)}
                onmouseleave={() => (hovered = 0)}
                onfocus={() => (hovered = n)}
                onblur={() => (hovered = 0)}
                aria-label="{n} star{n > 1 ? 's' : ''}"
                aria-pressed={rating === n}
                class="rounded-lg p-1 transition-transform hover:scale-110"
              >
                <Star
                  class="size-9 {n <= shown
                    ? 'fill-(--color-karma) text-(--color-karma)'
                    : 'fill-(--color-line) text-(--color-line)'}"
                />
              </button>
            {/each}
          </div>
          <p class="h-5 text-[0.875rem] font-bold text-(--color-ink-secondary)" aria-live="polite">
            {LABELS[shown] ?? ''}
          </p>
        </fieldset>

        <Textarea
          label="Comment"
          bind:value={comment}
          rows={4}
          placeholder="What did they do well? What would help the next person who books them?"
        />

        <div class="flex flex-wrap items-center gap-2 rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-elevated)/50 p-4 text-body-md text-(--color-ink-secondary)">
          Submitting settles the Karma:
          {#if isTeacher}
            you receive <KarmaBadge amount={session.karmaAmount} size="sm" glow={false} signed />
          {:else}
            you pay <KarmaBadge amount={-session.karmaAmount} size="sm" glow={false} signed />
          {/if}
          in one transaction.
        </div>

        {#if error}
          <p class="text-[0.8125rem] font-semibold text-(--color-danger)" role="alert">{error}</p>
        {/if}

        <Button type="submit" full>Submit review</Button>
      </form>
    </Card>
  </div>

  <Dialog bind:open={celebrate} title="Swap complete" size="sm">
    <div bind:this={burst} class="flex flex-col items-center gap-4 py-2 text-center">
      <div class="flex gap-2">
        {#each ['🎉', '⚡', '🎓'] as spark (spark)}
          <span data-spark class="text-3xl">{spark}</span>
        {/each}
      </div>
      <span class="grid size-16 place-items-center rounded-full bg-gradient-celebration text-white">
        <PartyPopper class="size-7" />
      </span>
      <div>
        <p class="text-title-md text-(--color-ink)">
          {isTeacher ? 'You taught' : 'You learned'}
          {session.requestedSkillTitle}
        </p>
        <p class="mt-1 text-body-md text-(--color-ink-muted)">
          Your review is live on {peer.name}'s profile.
        </p>
      </div>
      <KarmaBadge amount={isTeacher ? session.karmaAmount : -session.karmaAmount} size="lg" signed />
    </div>
    {#snippet footer()}
      <Button variant="outline" href="/sessions">Back to sessions</Button>
      <Button href="/karma">View wallet</Button>
    {/snippet}
  </Dialog>
{/if}
