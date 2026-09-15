<script lang="ts">
  import { ArrowLeft, Layers, Star, Zap } from 'lucide-svelte';
  import { page } from '$app/state';
  import { CAMPUS, KARMA, reviews, users } from '$shared/mock';
  import Brandmark from '$lib/components/Brandmark.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  let { children } = $props();

  // Read from the demo dataset, like the landing page, so the two cannot disagree.
  const active = users.filter((u) => u.status === 'active');
  const skillCount = new Set(active.flatMap((u) => u.skillsOffered.map((s) => s.title))).size;
  const subjectCount = new Set(active.flatMap((u) => u.skillsOffered.map((s) => s.category))).size;
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const freeHours = Math.floor(KARMA.JOINING_GRANT / KARMA.PER_SESSION);

  // Deliberately not one of the reviews on the landing page. Both sides must be
  // active accounts, the same rule the landing page applies.
  const quote = reviews.find((r) => r.id === 'rev-s-004');
  const quoteTeacher =
    quote && active.some((u) => u.id === quote.reviewerId)
      ? active.find((u) => u.id === quote.revieweeId)
      : undefined;

  const points = [
    { icon: Layers, text: `${skillCount} skills across ${subjectCount} subject areas, all taught by students.` },
    { icon: Zap, text: `Start with ${KARMA.JOINING_GRANT} Karma: ${freeHours} hours of learning before you teach anything.` },
    { icon: Star, text: `Every session is reviewed. ${reviews.length} reviews so far, averaging ${averageRating} out of 5.` }
  ];

  const HEADLINES: Record<string, string> = {
    '/login': 'Your sessions, messages and Karma are right where you left them.',
    '/signup': 'An hour of what you know buys an hour of what you do not.',
    '/reset-password': 'Locked out? Getting back in takes one email.'
  };
  const headline = $derived(
    HEADLINES[page.url.pathname.replace(/\/$/, '')] ?? HEADLINES['/signup']
  );
</script>

<div class="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
  <aside
    aria-label="About SkillSwap Campus"
    class="relative hidden overflow-hidden bg-gradient-brand text-white lg:flex lg:flex-col"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 [background:radial-gradient(70%_55%_at_0%_0%,rgba(255,255,255,0.16),transparent),radial-gradient(60%_50%_at_100%_100%,rgba(6,182,212,0.28),transparent)]"
    ></div>

    <div class="relative flex flex-1 flex-col justify-between gap-12 p-10 xl:p-14">
      <Brandmark inverse />

      <div class="max-w-md">
        <p class="text-[0.75rem] font-bold tracking-[0.08em] uppercase">{CAMPUS}</p>
        <p class="mt-4 text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.12] font-black tracking-[-0.03em]">
          {headline}
        </p>
        <ul class="mt-8 flex list-none flex-col gap-4">
          {#each points as point (point.text)}
            {@const Icon = point.icon}
            <li class="flex items-start gap-3">
              <span class="grid size-8 shrink-0 place-items-center rounded-[10px] bg-white/15">
                <Icon class="size-4" aria-hidden="true" />
              </span>
              <span class="pt-1 text-body-lg">{point.text}</span>
            </li>
          {/each}
        </ul>
      </div>

      {#if quote && quoteTeacher}
        <figure class="max-w-md rounded-[var(--radius-card)] border-[1.2px] border-white/25 bg-white/10 p-5">
          <blockquote class="text-[1.0625rem] leading-[1.5] font-semibold">“{quote.comment}”</blockquote>
          <figcaption class="mt-4 border-t-[1.2px] border-white/20 pt-3">
            <p class="text-title-sm">{quote.reviewerName}</p>
            <p class="text-body-sm">on {quoteTeacher.name}’s {quote.skillName} session</p>
          </figcaption>
        </figure>
      {/if}
    </div>
  </aside>

  <div class="flex min-h-dvh flex-col">
    <header class="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Brandmark class="lg:hidden" />
      <a
        href="/"
        class="hidden items-center gap-2 text-[0.875rem] font-bold text-(--color-ink-secondary) hover:text-(--color-ink) lg:inline-flex"
      >
        <ArrowLeft class="size-4" aria-hidden="true" /> Back to home
      </a>
      <ThemeSwitcher />
    </header>

    <main id="main" class="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
      <div class="w-full max-w-[26rem]">
        {@render children()}
      </div>
    </main>

    <footer class="px-5 py-5 text-center text-body-sm text-(--color-ink-muted) sm:px-8">
      Demo build: no real accounts are created and no emails are sent.
    </footer>
  </div>
</div>
