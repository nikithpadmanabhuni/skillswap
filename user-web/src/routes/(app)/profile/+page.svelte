<script lang="ts">
  import { CalendarClock, Mail, MapPin, Pencil, Phone } from 'lucide-svelte';
  import { Badge, Button, Card, StatTile } from '$shared/components/ui';
  import {
    BadgeTile,
    KarmaBadge,
    RatingStars,
    SectionHeader,
    SkillChip
  } from '$shared/components/domain';
  import { CURRENT_USER_ID, badgesFor, currentUser, reviewsFor } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';

  const badges = badgesFor(currentUser);
  const unlocked = badges.filter((b) => b.isUnlocked).length;
  const reviews = reviewsFor(CURRENT_USER_ID).slice(0, 4);
</script>

<svelte:head><title>Your profile · SkillSwap Campus</title></svelte:head>

<Card class="flex flex-col gap-5">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
    <span
      class="grid size-20 shrink-0 place-items-center rounded-full bg-(--color-primary)/20 text-[1.75rem] font-black text-(--color-primary)"
      aria-hidden="true"
    >
      {currentUser.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')}
    </span>

    <div class="min-w-0 flex-1">
      <h1 class="text-display leading-tight text-(--color-ink)">{currentUser.name}</h1>
      <p class="mt-1 text-body-lg text-(--color-ink-secondary)">{currentUser.major}</p>
      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <RatingStars rating={currentUser.rating} count={currentUser.reviewCount} />
        <span class="inline-flex items-center gap-1.5 text-[0.8125rem] text-(--color-ink-muted)">
          <MapPin class="size-3.5" />{currentUser.campus}
        </span>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <KarmaBadge amount={currentUser.karmaBalance} />
      <Button variant="outline" href="/profile/edit"><Pencil /> Edit</Button>
    </div>
  </div>

  {#if currentUser.bio}
    <p class="text-body-lg leading-relaxed text-(--color-ink-secondary)">{currentUser.bio}</p>
  {/if}

  <!-- Contact details are on YOUR profile only. Peer views read the PII-free
       projection instead (audit P1-4). -->
  <dl class="flex flex-wrap gap-x-6 gap-y-2 border-t-[1.2px] border-(--color-line) pt-4 text-[0.8125rem]">
    <div class="inline-flex items-center gap-2">
      <Mail class="size-3.5 text-(--color-ink-muted)" />
      <dt class="sr-only">Email</dt>
      <dd class="text-(--color-ink-secondary)">{currentUser.email}</dd>
    </div>
    <div class="inline-flex items-center gap-2">
      <Phone class="size-3.5 text-(--color-ink-muted)" />
      <dt class="sr-only">Phone</dt>
      <dd class="text-(--color-ink-secondary)">{currentUser.phoneNumber}</dd>
    </div>
  </dl>
  <p class="-mt-2 text-[0.75rem] text-(--color-ink-muted)">
    Only you can see your email and phone number. They are never sent to other students.
  </p>
</Card>

<div class="mt-4 grid gap-3 sm:grid-cols-4">
  <StatTile label="Taught" value="{currentUser.hoursTaught}h" tone="emerald" />
  <StatTile label="Learned" value="{currentUser.hoursLearned}h" tone="brand" />
  <StatTile label="Rating" value={currentUser.rating.toFixed(1)} tone="karma" sub="{currentUser.reviewCount} reviews" />
  <StatTile label="Badges" value="{unlocked}/{badges.length}" tone="neutral" />
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
  <section>
    <SectionHeader title="You teach" subtitle="Skills you offer. Teaching earns Karma." />
    <div class="mt-2 flex flex-wrap gap-2">
      {#each currentUser.skillsOffered as skill (skill.id)}
        <SkillChip {skill} />
      {:else}
        <p class="text-body-md text-(--color-ink-muted)">Nothing listed yet.</p>
      {/each}
    </div>
  </section>

  <section>
    <SectionHeader title="You want to learn" subtitle="The more you list, the more matches appear." />
    <div class="mt-2 flex flex-wrap gap-2">
      {#each currentUser.skillsWanted as skill (skill.id)}
        <SkillChip {skill} />
      {:else}
        <p class="text-body-md text-(--color-ink-muted)">Nothing listed yet.</p>
      {/each}
    </div>
  </section>
</div>

<section class="mt-6">
  <SectionHeader title="Availability" />
  <div class="mt-2 flex flex-wrap gap-2">
    {#each currentUser.availability as slot (slot)}
      <Badge tone="ocean"><CalendarClock />{slot}</Badge>
    {/each}
  </div>
</section>

<section class="mt-6">
  <SectionHeader title="Badges" subtitle="{unlocked} of {badges.length} unlocked." />
  <div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {#each badges as badge (badge.id)}
      <BadgeTile {badge} />
    {/each}
  </div>
</section>

<section class="mt-6">
  <SectionHeader title="Recent reviews" subtitle="What students said after your sessions." />
  <ul class="mt-2 grid gap-3 sm:grid-cols-2">
    {#each reviews as review (review.id)}
      <li>
        <Card class="flex h-full flex-col gap-2">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[0.8125rem] font-bold text-(--color-ink)">{review.skillName}</span>
            <RatingStars rating={review.rating} size={12} />
          </div>
          <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">{review.comment}</p>
          <p class="mt-auto text-[0.6875rem] text-(--color-ink-muted)">
            {review.reviewerName} · {formatDate(review.createdAt)}
          </p>
        </Card>
      </li>
    {:else}
      <li class="text-body-md text-(--color-ink-muted)">No reviews yet.</li>
    {/each}
  </ul>
</section>
