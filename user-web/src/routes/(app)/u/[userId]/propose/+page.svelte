<script lang="ts">
  import { ArrowLeft, Repeat, Send } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Avatar, Button, Card, Select, Textarea, toasts } from '$shared/components/ui';
  import { KarmaBadge, SkillChip } from '$shared/components/domain';
  import { KARMA, currentUser, getProfile } from '$shared/mock';

  const peer = $derived(getProfile(page.params.userId ?? ''));

  let requestedSkillId = $state('');
  let offeredSkillId = $state('');
  let note = $state('');
  let error = $state('');

  const requestOptions = $derived(
    (peer?.skillsOffered ?? []).map((s) => ({ value: s.id, label: s.title }))
  );

  // Only skills the peer actually wants are worth offering — anything else is
  // noise, and a swap they do not want is just a Karma-settled session.
  const offerOptions = $derived([
    { value: '', label: 'Nothing — settle in Karma' },
    ...currentUser.skillsOffered
      .filter((mine) => peer?.skillsWanted.some((w) => w.title === mine.title))
      .map((s) => ({ value: s.id, label: `${s.title} (they want this)` }))
  ]);

  $effect(() => {
    if (!requestedSkillId && requestOptions.length) requestedSkillId = requestOptions[0].value;
  });

  const requested = $derived(peer?.skillsOffered.find((s) => s.id === requestedSkillId));
  const offered = $derived(currentUser.skillsOffered.find((s) => s.id === offeredSkillId));
  const isMutual = $derived(Boolean(offered));
  const affordable = $derived(isMutual || currentUser.karmaBalance >= KARMA.PER_SESSION);

  // TODO: convert to a form action (POST /u/[userId]/propose). Spec 3.5: the
  // session and its chat thread are created in one transaction.
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!requestedSkillId) return (error = 'Choose what you want to learn.');
    if (!affordable)
      return (error = `You need ${KARMA.PER_SESSION} Karma to book a one-way session, and you have ${currentUser.karmaBalance}.`);
    error = '';
    toasts.success(`Swap proposed to ${peer?.name.split(' ')[0]}. It is now pending their reply.`);
    await goto('/sessions');
  }
</script>

<svelte:head><title>Propose a swap · SkillSwap Campus</title></svelte:head>

{#if !peer}
  <Card class="text-center">
    <p class="text-body-lg">That profile does not exist.</p>
    <Button href="/explore" variant="outline" class="mt-4">Back to explore</Button>
  </Card>
{:else}
  <a
    href="/u/{peer.id}"
    class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
  >
    <ArrowLeft class="size-4" /> {peer.name}
  </a>

  <div class="mx-auto max-w-xl">
    <Card class="flex flex-col gap-5">
      <div class="flex items-center gap-3">
        <Avatar name={peer.name} src={peer.avatarUrl} size={48} />
        <div class="min-w-0">
          <h1 class="text-title-lg text-(--color-ink)">Propose a swap</h1>
          <p class="truncate text-body-md text-(--color-ink-muted)">
            with {peer.name} · {peer.campus}
          </p>
        </div>
      </div>

      <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
        <Select
          label="What do you want to learn?"
          options={requestOptions}
          bind:value={requestedSkillId}
        />

        <Select
          label="Offer something in return? (optional)"
          options={offerOptions}
          bind:value={offeredSkillId}
        />

        <Textarea
          label="Add a note"
          bind:value={note}
          rows={3}
          placeholder="Say what you already know and what you are hoping to get out of it. Specific beats polite."
        />

        <!-- What this trade actually costs, before they commit to it. -->
        <div class="rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-elevated)/50 p-4">
          <p class="text-[0.75rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
            How this settles
          </p>
          {#if isMutual}
            <p class="mt-2 text-body-md leading-[1.45] text-(--color-ink-secondary)">
              A direct mutual swap. You each teach one session, so the Karma cancels out and neither
              of you pays anything.
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              {#if requested}<SkillChip skill={requested} showLevel={false} />{/if}
              <Repeat class="size-4 text-(--color-ink-muted)" />
              {#if offered}<SkillChip skill={offered} showLevel={false} />{/if}
            </div>
          {:else}
            <p class="mt-2 flex flex-wrap items-center gap-1.5 text-body-md leading-[1.45] text-(--color-ink-secondary)">
              A one-way session. You will spend
              <KarmaBadge amount={KARMA.PER_SESSION} size="sm" glow={false} />
              when you submit your review, leaving you
              <strong class="font-bold text-(--color-ink)">
                {currentUser.karmaBalance - KARMA.PER_SESSION}
              </strong>.
            </p>
          {/if}
        </div>

        {#if error}
          <p class="text-[0.8125rem] font-semibold text-(--color-danger)" role="alert">{error}</p>
        {/if}

        <div class="flex gap-2">
          <Button variant="outline" href="/u/{peer.id}" class="flex-1">Cancel</Button>
          <Button type="submit" class="flex-1" disabled={!affordable}><Send /> Send proposal</Button>
        </div>
      </form>
    </Card>
  </div>
{/if}
