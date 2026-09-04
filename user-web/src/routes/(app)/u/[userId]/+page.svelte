<script lang="ts">
  import { ArrowLeft, CalendarClock, Flag, GraduationCap, MapPin, Repeat } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Badge, Button, Card, Dialog, Textarea, toasts } from '$shared/components/ui';
  import {
    BadgeTile,
    KarmaBadge,
    RatingStars,
    SectionHeader,
    SkillChip
  } from '$shared/components/domain';
  import { badgesFor, getProfile, getUser, matches, reviewsFor } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';

  const peer = $derived(getProfile(page.params.userId ?? ''));
  const match = $derived(matches.find((m) => m.targetUserId === page.params.userId));
  const reviews = $derived(peer ? reviewsFor(peer.id).slice(0, 5) : []);
  // badgesFor wants the full User; a peer's badges are public, their PII is not.
  const badges = $derived(peer ? badgesFor(getUser(peer.id)!) : []);

  let reportOpen = $state(false);
  let reportReason = $state('');
</script>

<svelte:head><title>{peer?.name ?? 'Profile'} · SkillSwap Campus</title></svelte:head>

{#if !peer}
  <Card class="text-center">
    <p class="text-body-lg text-(--color-ink)">That profile does not exist.</p>
    <Button href="/explore" variant="outline" class="mt-4">Back to explore</Button>
  </Card>
{:else}
  <a
    href="/explore"
    class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
  >
    <ArrowLeft class="size-4" /> Explore
  </a>

  <Card class="flex flex-col gap-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <Avatar name={peer.name} src={peer.avatarUrl} size={80} />

      <div class="min-w-0 flex-1">
        <h1 class="text-display leading-tight text-(--color-ink)">{peer.name}</h1>
        <p class="mt-1 text-body-lg text-(--color-ink-secondary)">{peer.major}</p>
        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <RatingStars rating={peer.rating} count={peer.reviewCount} />
          <span class="inline-flex items-center gap-1.5 text-[0.8125rem] text-(--color-ink-muted)">
            <MapPin class="size-3.5" />{peer.campus}
          </span>
          <KarmaBadge amount={peer.karmaBalance} size="sm" glow={false} />
        </div>
      </div>

      <div class="flex shrink-0 gap-2">
        <Button href="/u/{peer.id}/propose"><Repeat /> Propose swap</Button>
        <Button variant="outline" size="icon" onclick={() => (reportOpen = true)} aria-label="Report {peer.name}">
          <Flag />
        </Button>
      </div>
    </div>

    {#if peer.bio}
      <p class="text-body-lg leading-relaxed text-(--color-ink-secondary)">{peer.bio}</p>
    {/if}

    <dl class="grid grid-cols-2 gap-3 border-t-[1.2px] border-(--color-line) pt-4 sm:grid-cols-4">
      {#each [['Taught', `${peer.hoursTaught}h`], ['Learned', `${peer.hoursLearned}h`], ['Rating', peer.rating.toFixed(1)], ['Reviews', peer.reviewCount]] as [label, value] (label)}
        <div>
          <dt class="text-[0.6875rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
            {label}
          </dt>
          <dd class="mt-1 text-[1.25rem] font-black tabular-nums text-(--color-ink)">{value}</dd>
        </div>
      {/each}
    </dl>
  </Card>

  {#if match}
    <Card class="mt-4 border-(--color-emerald)/40 bg-(--color-emerald)/6">
      <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">
        <strong class="font-bold text-(--color-ink)">Why you match:</strong>
        {match.reasoning}
      </p>
    </Card>
  {/if}

  <div class="mt-6 grid gap-6 lg:grid-cols-2">
    <section aria-labelledby="offers">
      <SectionHeader title="Teaches" subtitle="Skills {peer.name.split(' ')[0]} offers." />
      <div class="mt-2 flex flex-wrap gap-2">
        {#each peer.skillsOffered as skill (skill.id)}
          <SkillChip {skill} />
        {:else}
          <p class="text-body-md text-(--color-ink-muted)">Nothing listed yet.</p>
        {/each}
      </div>
      <span id="offers" class="sr-only">Skills offered</span>
    </section>

    <section aria-labelledby="wants">
      <SectionHeader title="Wants to learn" subtitle="Teach one of these to earn Karma." />
      <div class="mt-2 flex flex-wrap gap-2">
        {#each peer.skillsWanted as skill (skill.id)}
          <SkillChip {skill} />
        {:else}
          <p class="text-body-md text-(--color-ink-muted)">Nothing listed yet.</p>
        {/each}
      </div>
      <span id="wants" class="sr-only">Skills wanted</span>
    </section>
  </div>

  <section class="mt-6">
    <SectionHeader title="Availability" />
    <div class="mt-2 flex flex-wrap gap-2">
      {#each peer.availability as slot (slot)}
        <Badge tone="ocean"><CalendarClock />{slot}</Badge>
      {:else}
        <p class="text-body-md text-(--color-ink-muted)">No availability set.</p>
      {/each}
    </div>
  </section>

  <section class="mt-6">
    <SectionHeader title="Badges" />
    <div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {#each badges as badge (badge.id)}
        <BadgeTile {badge} />
      {/each}
    </div>
  </section>

  <section class="mt-6">
    <SectionHeader
      title="Reviews"
      subtitle="{peer.reviewCount} from students who took a session."
    />
    <ul class="mt-2 flex flex-col gap-3">
      {#each reviews as review (review.id)}
        <li>
          <Card class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-3">
              <span class="inline-flex items-center gap-2 text-[0.8125rem] font-bold text-(--color-ink)">
                <GraduationCap class="size-3.5 text-(--color-ink-muted)" />
                {review.skillName}
              </span>
              <RatingStars rating={review.rating} size={12} />
            </div>
            <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">{review.comment}</p>
            <p class="text-[0.6875rem] text-(--color-ink-muted)">
              {review.reviewerName} · {formatDate(review.createdAt)}
            </p>
          </Card>
        </li>
      {:else}
        <li class="text-body-md text-(--color-ink-muted)">No reviews yet.</li>
      {/each}
    </ul>
  </section>

  <Dialog
    bind:open={reportOpen}
    title="Report {peer.name}"
    description="A moderator reviews every report. Nothing is shared with the person you are reporting."
  >
    <Textarea
      label="What happened?"
      bind:value={reportReason}
      placeholder="Be specific — dates, sessions, and what was said help the moderator act."
    />
    {#snippet footer()}
      <Button variant="outline" onclick={() => (reportOpen = false)}>Cancel</Button>
      <Button
        variant="danger"
        onclick={() => {
          // TODO: convert to a form action (POST /u/[userId]/report).
          reportOpen = false;
          reportReason = '';
          toasts.success('Report submitted. A moderator will review it.');
        }}
      >
        Submit report
      </Button>
    {/snippet}
  </Dialog>
{/if}
