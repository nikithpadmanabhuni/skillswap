<script lang="ts">
  import {
    ArrowLeftRight,
    ArrowRight,
    CircleCheck,
    Quote,
    Sparkles,
    Triangle,
    Zap
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Avatar, Badge, Button, Card } from '$shared/components/ui';
  import {
    CATEGORY_TONES,
    KarmaBadge,
    MatchScoreBadge,
    RatingStars,
    SkillCategoryIcon,
    SkillChip
  } from '$shared/components/domain';
  import { CATEGORY_LABELS, type User } from '$shared/types';
  import {
    CAMPUS,
    KARMA,
    learnerOf,
    matches,
    mutualMatches,
    peers,
    perks,
    reviews,
    settledSessions,
    teacherOf,
    users
  } from '$shared/mock';
  import Brandmark from '$lib/components/Brandmark.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import { session } from '$lib/session.svelte';

  // Spec 5.2: "/ — marketing/landing; redirects to /explore if signed in".
  $effect(() => {
    if (session.signedIn) goto('/explore', { replaceState: true });
  });

  /*
   * Every name, quote and figure on this page is read from the demo dataset at
   * render time. Nothing is typed in, rounded up or estimated, so the page
   * cannot drift from the app behind it. Suspended accounts are filtered out:
   * nobody can reach them from the app, so they do not appear in its marketing.
   */
  const active = users.filter((u) => u.status === 'active');
  const isActive = (id: string) => active.some((u) => u.id === id);
  const person = (name: string) => active.find((u) => u.name === name)!;
  const firstName = (u: User) => u.name.split(' ')[0];
  const offerOf = (u: User, title: string) => u.skillsOffered.find((s) => s.title === title)!;
  const wantOf = (u: User, title: string) => u.skillsWanted.find((s) => s.title === title)!;
  const teachersOf = (title: string) =>
    active.filter((u) => u.skillsOffered.some((s) => s.title === title));

  const skillCount = new Set(active.flatMap((u) => u.skillsOffered.map((s) => s.title))).size;
  const hoursTaught = settledSessions.reduce((sum, s) => sum + s.durationHours, 0);
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const freeHours = Math.floor(KARMA.JOINING_GRANT / KARMA.PER_SESSION);
  const cheapestPerk = Math.min(...perks.map((p) => p.karmaCost));

  const navLinks = [
    { href: '#outcomes', label: 'What you can learn' },
    { href: '#teach', label: 'Teaching' },
    { href: '#how', label: 'How it works' },
    { href: '#reviews', label: 'Reviews' }
  ];

  /* ---------------------------------------------------------------- hero */
  const heroLearner = person('Aarav Mehta');
  const heroTeacher = person('Priya Raghunathan');
  const heroWant = wantOf(heroLearner, 'Acoustic Guitar');
  const heroOffer = offerOf(heroTeacher, 'Acoustic Guitar');
  const heroMatch = matches.find((m) => m.targetUserId === heroTeacher.id)!;
  const heroReview = reviews.find((r) => r.id === 'rev-s-001')!;

  const stats = [
    { value: String(active.length), label: 'students, every one of them teaching' },
    { value: String(skillCount), label: 'skills on offer' },
    { value: String(hoursTaught), label: 'hours taught' },
    { value: averageRating, label: `average rating across ${reviews.length} reviews` }
  ];

  /* ------------------------------------------------ what an hour gets you */
  // One listing from each of the seven subject areas, quoted as its author wrote it.
  const showcase = [
    ['Marcus Bell', 'Piano'],
    ['Tomas Nowak', 'Statistics'],
    ['Mei-Ling Chen', 'Figma'],
    ['Daniel Okonjo', 'Spanish'],
    ['Kwame Asante', 'Embedded C'],
    ['Sofia Almeida', 'Knife Skills'],
    ['Aisha Rahman', 'Running Coaching']
  ].map(([name, title]) => {
    const u = person(name);
    return { u, skill: offerOf(u, title) };
  });
  const moreSkills = skillCount - showcase.length;

  /* ----------------------------------------------------- stuck → fluent */
  const pairs = [
    ['Marcus Bell', 'Statistics', 'Tomas Nowak'],
    ['Sofia Almeida', 'Figma', 'Mei-Ling Chen'],
    ['Yuki Tanaka', 'Baking', 'Sofia Almeida']
  ].map(([learnerName, title, teacherName]) => {
    const learner = person(learnerName);
    const teacher = person(teacherName);
    return { learner, want: wantOf(learner, title), teacher, offer: offerOf(teacher, title) };
  });

  const wants = active.flatMap((u) => u.skillsWanted.map((s) => ({ u, s })));
  const outsideOwnSubjects = wants.filter(
    ({ u, s }) => !u.skillsOffered.some((o) => o.category === s.category)
  ).length;

  const [statsPair, figmaPair, bakingPair] = pairs;
  const statsHours = settledSessions.filter(
    (s) => teacherOf(s) === statsPair.teacher.id && s.requestedSkillTitle === statsPair.offer.title
  );
  const statsLearners = new Set(statsHours.map(learnerOf)).size;

  const pairNotes = [
    teachersOf(statsPair.offer.title).length === 1
      ? `${firstName(statsPair.teacher)} is the only student here teaching ${statsPair.offer.title}, and has taught it ${statsHours.length} times to ${statsLearners} different students.`
      : `${firstName(statsPair.teacher)} has taught ${statsPair.offer.title} ${statsHours.length} times to ${statsLearners} different students.`,
    `${figmaPair.learner.major}, meet ${figmaPair.teacher.major}. A different department, and ${
      teachersOf(figmaPair.offer.title).length === 1
        ? `the only ${figmaPair.offer.title} teacher on SkillSwap`
        : `one of ${teachersOf(figmaPair.offer.title).length} ${figmaPair.offer.title} teachers here`
    }.`,
    `Same ${firstName(bakingPair.teacher)}, other side of the table. That is normal here: ${outsideOwnSubjects} of the ${wants.length} things students want to learn sit outside the subjects they teach.`
  ];

  /* ------------------------------------------------ something to teach */
  const jamie = person('Jamie Roth');
  const jamieOffer = jamie.skillsOffered[0];

  const singleTeacherWants = wants.filter(
    ({ u, s }) =>
      active.filter((o) => o.id !== u.id && o.skillsOffered.some((x) => x.title === s.title))
        .length === 1
  ).length;

  const wantCounts = new Map<string, number>();
  for (const { s } of wants) wantCounts.set(s.title, (wantCounts.get(s.title) ?? 0) + 1);
  const scarce = [...wantCounts]
    .filter(([title, n]) => n >= 2 && teachersOf(title).length === 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);
  const unanswered = [...wantCounts.keys()].filter((title) => teachersOf(title).length === 0);

  /* ------------------------------------------------------ how it clears */
  const oneWay = matches.length - mutualMatches.length;
  const mechanisms = [
    {
      icon: ArrowLeftRight,
      title: 'Straight swap',
      body: 'You want what they teach, and they want what you teach. An hour each way, nothing else changes hands.',
      detail: `For ${firstName(heroLearner)}, ${mutualMatches.length} of ${peers.length} classmates line up exactly like this.`
    },
    {
      icon: Zap,
      title: 'Settled in Karma',
      body: `Teach anyone for an hour and earn ${KARMA.PER_SESSION} Karma. Spend it learning from anyone else. They never need to want what you know.`,
      detail: `That opens up ${oneWay} more of ${firstName(heroLearner)}’s matches.`
    },
    {
      icon: Triangle,
      title: 'A circle of three',
      body: 'You teach one person, they teach a second, and the second teaches you. Nobody pays anybody, and everybody gets their hour.',
      detail: 'SkillSwap looks for these loops so you do not have to.'
    }
  ];

  /* ------------------------------------------------------------ reviews */
  // Four distinct learners, four distinct teachers, four distinct comments.
  const featured = ['rev-s-014', 'rev-s-h075', 'rev-s-002', 'rev-s-005']
    .map((id) => reviews.find((r) => r.id === id)!)
    .filter((r) => isActive(r.reviewerId) && isActive(r.revieweeId))
    .map((r) => ({ review: r, teacher: active.find((u) => u.id === r.revieweeId)! }));
</script>

<svelte:head>
  <title>SkillSwap Campus · Learn anything. Pay with what you know.</title>
</svelte:head>

{#snippet sectionHead(id: string, eyebrow: string, title: string, sub: string)}
  <div class="max-w-2xl">
    <p class="text-[0.75rem] font-bold tracking-[0.08em] text-(--color-primary) uppercase">{eyebrow}</p>
    <h2
      {id}
      class="mt-3 text-[clamp(1.625rem,3.6vw,2.375rem)] leading-[1.1] font-black tracking-[-0.03em] text-(--color-ink)"
    >
      {title}
    </h2>
    <p class="mt-4 text-[1.0625rem] leading-[1.6] text-(--color-ink-secondary)">{sub}</p>
  </div>
{/snippet}

<header
  class="sticky top-0 z-30 border-b-[1.2px] border-(--color-line) bg-(--color-bg)/85 backdrop-blur-md"
>
  <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
    <Brandmark collapse />
    <nav aria-label="Primary" class="hidden items-center gap-7 lg:flex">
      {#each navLinks as link (link.href)}
        <a
          href={link.href}
          class="text-[0.875rem] font-semibold text-(--color-ink-secondary) transition-colors hover:text-(--color-ink)"
        >
          {link.label}
        </a>
      {/each}
    </nav>
    <div class="flex items-center gap-2">
      <div class="hidden sm:block"><ThemeSwitcher /></div>
      <Button href="/login" variant="ghost" size="sm">Sign in</Button>
      <Button href="/signup" size="sm">Get started</Button>
    </div>
  </div>
</header>

<main id="main">
  <!-- ------------------------------------------------------------ hero -->
  <section aria-labelledby="hero-title" class="relative overflow-hidden">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-gradient-mesh opacity-[0.09] [mask-image:radial-gradient(60%_70%_at_75%_0%,#000,transparent)]"
    ></div>

    <div
      class="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-20 lg:pb-24"
    >
      <div>
        <p
          class="enter inline-flex items-center gap-2 rounded-full border-[1.2px] border-(--color-line) bg-(--color-card) px-3 py-1.5 text-[0.75rem] font-bold text-(--color-ink-secondary)"
        >
          <Sparkles class="size-3.5 text-(--color-primary)" aria-hidden="true" />
          {skillCount} skills, taught by students at {CAMPUS}
        </p>

        <h1
          id="hero-title"
          class="enter mt-6 text-[clamp(2.25rem,5.6vw,3.75rem)] leading-[1.04] font-black tracking-[-0.035em] text-(--color-ink)"
          style="--d: 60ms"
        >
          Learn what you keep putting off.
          <span class="text-(--color-primary)">Pay with what you already know.</span>
        </h1>

        <p
          class="enter mt-6 max-w-xl text-[1.0625rem] leading-[1.65] text-(--color-ink-secondary) sm:text-[1.125rem]"
          style="--d: 120ms"
        >
          SkillSwap Campus puts you in a room with the student who is fluent in the thing you are
          stuck on, and who wants to learn something you can teach. Trade an hour for an hour. No
          fees, no tutors for hire, no money changing hands.
        </p>

        <div class="enter mt-8 flex flex-wrap items-center gap-3" style="--d: 180ms">
          <Button href="/signup" size="lg">Create your free account <ArrowRight /></Button>
          <Button href="#outcomes" size="lg" variant="outline">See what an hour gets you</Button>
        </div>

        <p
          class="enter mt-5 flex items-center gap-2.5 text-[0.875rem] text-(--color-ink-muted)"
          style="--d: 240ms"
        >
          <KarmaBadge amount={KARMA.JOINING_GRANT} size="sm" glow={false} class="shrink-0" />
          <span>Karma on joining: {freeHours} hours of learning before you teach anything.</span>
        </p>
      </div>

      <figure class="enter mx-auto flex w-full max-w-md flex-col lg:max-w-none" style="--d: 150ms">
        <Card class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <Avatar name={heroLearner.name} size={40} />
            <div class="min-w-0 flex-1">
              <p class="truncate text-title-sm text-(--color-ink)">{heroLearner.name}</p>
              <p class="truncate text-body-sm text-(--color-ink-muted)">{heroLearner.major}</p>
            </div>
            <Badge tone="brand" size="sm">Wants to learn</Badge>
          </div>
          <div><SkillChip skill={heroWant} /></div>
          <p class="text-body-md text-(--color-ink-secondary)">“{heroWant.description}”</p>
        </Card>

        <div class="flex items-center gap-3 px-1 py-2.5">
          <span class="h-px flex-1 bg-(--color-line)"></span>
          <MatchScoreBadge score={heroMatch.matchPercentage} isMutual={heroMatch.isMutual} />
          <span class="h-px flex-1 bg-(--color-line)"></span>
        </div>

        <Card class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <Avatar name={heroTeacher.name} size={40} />
            <div class="min-w-0 flex-1">
              <p class="truncate text-title-sm text-(--color-ink)">{heroTeacher.name}</p>
              <p class="truncate text-body-sm text-(--color-ink-muted)">{heroTeacher.major}</p>
            </div>
            <Badge tone="emerald" size="sm">Teaches</Badge>
          </div>
          <div><SkillChip skill={heroOffer} /></div>
          <p class="text-body-md text-(--color-ink-secondary)">“{heroOffer.description}”</p>
          <div
            class="flex flex-wrap items-center justify-between gap-2 border-t-[1.2px] border-(--color-line) pt-3"
          >
            <RatingStars rating={heroTeacher.rating} count={heroTeacher.reviewCount} />
            <span class="text-body-sm text-(--color-ink-muted)">
              {heroTeacher.hoursTaught} hours taught
            </span>
          </div>
        </Card>

        <div
          class="mt-2.5 flex items-start gap-2.5 rounded-[var(--radius-card)] border-[1.2px] border-(--color-emerald)/35 bg-(--color-emerald)/10 p-4"
        >
          <CircleCheck class="mt-0.5 size-4 shrink-0 text-(--color-emerald)" aria-hidden="true" />
          <p class="text-body-md text-(--color-ink-secondary)">
            <span class="font-bold text-(--color-ink)">Taught and reviewed.</span>
            {firstName(heroLearner)} gave it {heroReview.rating} stars: “{heroReview.comment}”
          </p>
        </div>

        <figcaption class="mt-3 text-center text-body-sm text-(--color-ink-muted)">
          A swap from the demo dataset, shown as it happened.
        </figcaption>
      </figure>
    </div>
  </section>

  <!-- ----------------------------------------------------------- stats -->
  <section aria-label="SkillSwap Campus in numbers" class="border-y-[1.2px] border-(--color-line) bg-(--color-card)">
    <dl class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-9 sm:px-8 lg:grid-cols-4">
      {#each stats as stat (stat.label)}
        <div
          class="flex flex-col gap-1.5 lg:border-l-[1.2px] lg:border-(--color-line) lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
        >
          <dt class="order-2 text-body-md text-(--color-ink-muted)">{stat.label}</dt>
          <dd
            class="order-1 text-[clamp(1.875rem,3.5vw,2.5rem)] leading-none font-black tracking-[-0.03em] text-(--color-ink)"
          >
            {stat.value}
          </dd>
        </div>
      {/each}
    </dl>
  </section>

  <!-- ------------------------------------------ what an hour gets you -->
  <section id="outcomes" aria-labelledby="outcomes-title" class="scroll-mt-20">
    <div class="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      {@render sectionHead(
        'outcomes-title',
        'What an hour gets you',
        'Real skills, from the students who teach them.',
        'Every card is a listing quoted exactly as its author wrote it, one from each of the seven subject areas on SkillSwap.'
      )}

      <ul class="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each showcase as { u, skill } (skill.id)}
          {@const tone = CATEGORY_TONES[skill.category]}
          <li>
            <Card class="flex h-full flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <span
                  class="grid size-11 place-items-center rounded-[var(--radius-button)] border-[1.2px]"
                  style="color: {tone}; background-color: color-mix(in srgb, {tone} 12%, transparent); border-color: color-mix(in srgb, {tone} 30%, transparent)"
                >
                  <SkillCategoryIcon category={skill.category} class="size-5" />
                </span>
                <span class="text-[0.6875rem] font-bold tracking-[0.06em] text-(--color-ink-muted) uppercase">
                  {CATEGORY_LABELS[skill.category]}
                </span>
              </div>
              <div>
                <h3 class="text-title-md text-(--color-ink)">{skill.title}</h3>
                <p class="mt-2 text-body-lg text-(--color-ink-secondary)">“{skill.description}”</p>
              </div>
              <div class="mt-auto flex items-center gap-2.5 border-t-[1.2px] border-(--color-line) pt-4">
                <Avatar name={u.name} size={32} />
                <div class="min-w-0">
                  <p class="truncate text-title-sm text-(--color-ink)">{u.name}</p>
                  <p class="truncate text-body-sm text-(--color-ink-muted)">{u.major}</p>
                </div>
              </div>
            </Card>
          </li>
        {/each}

        <li>
          <Card class="flex h-full flex-col justify-between gap-6 bg-(--color-elevated)">
            <div>
              <p class="text-[2.75rem] leading-none font-black tracking-[-0.03em] text-(--color-ink)">
                +{moreSkills}
              </p>
              <h3 class="mt-3 text-title-md text-(--color-ink)">more skills to choose from</h3>
              <p class="mt-2 text-body-md text-(--color-ink-secondary)">
                From Go and databases to bouldering and baking. See every one once you are in.
              </p>
            </div>
            <Button href="/signup" variant="outline" full>Join to browse <ArrowRight /></Button>
          </Card>
        </li>
      </ul>
    </div>
  </section>

  <!-- --------------------------------------------------- stuck → fluent -->
  <section
    aria-labelledby="stuck-title"
    class="border-y-[1.2px] border-(--color-line) bg-(--color-elevated)/40"
  >
    <div class="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      {@render sectionHead(
        'stuck-title',
        'Matched on what you need',
        'Whatever you are stuck on, someone here is fluent in it.',
        'Three requests from the dataset, each beside the student who can answer it, in both of their own words.'
      )}

      <ol class="mt-10 flex list-none flex-col gap-4">
        {#each pairs as pair, i (pair.want.id)}
          <li>
            <Card
              class="grid gap-5 bg-(--color-card) md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-6"
            >
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <Avatar name={pair.learner.name} size={36} />
                  <div class="min-w-0">
                    <p class="truncate text-title-sm text-(--color-ink)">{pair.learner.name}</p>
                    <p class="truncate text-body-sm text-(--color-ink-muted)">{pair.learner.major}</p>
                  </div>
                </div>
                <p class="text-body-lg text-(--color-ink-secondary)">
                  <span class="font-bold text-(--color-ink)">Wants {pair.want.title}.</span>
                  “{pair.want.description}”
                </p>
              </div>

              <span
                class="grid size-10 place-items-center justify-self-center rounded-full border-[1.2px] border-(--color-line) bg-(--color-elevated) text-(--color-primary)"
                aria-hidden="true"
              >
                <ArrowRight class="size-4 rotate-90 md:rotate-0" />
              </span>

              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <Avatar name={pair.teacher.name} size={36} />
                  <div class="min-w-0">
                    <p class="truncate text-title-sm text-(--color-ink)">{pair.teacher.name}</p>
                    <p class="truncate text-body-sm text-(--color-ink-muted)">{pair.teacher.major}</p>
                  </div>
                </div>
                <p class="text-body-lg text-(--color-ink-secondary)">
                  <span class="font-bold text-(--color-ink)">Teaches {pair.offer.title}.</span>
                  “{pair.offer.description}”
                </p>
              </div>

              <p
                class="border-t-[1.2px] border-(--color-line) pt-4 text-body-md text-(--color-ink-muted) md:col-span-3"
              >
                {pairNotes[i]}
              </p>
            </Card>
          </li>
        {/each}
      </ol>
    </div>
  </section>

  <!-- ------------------------------------------- something to teach -->
  <section id="teach" aria-labelledby="teach-title" class="scroll-mt-20">
    <div
      class="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:py-24"
    >
      <div class="flex flex-col">
        {@render sectionHead(
          'teach-title',
          'For every student',
          'You already know something worth teaching.',
          'You are not applying to be a tutor. You need to be one step ahead of somebody, and willing to give them an hour. That is the whole entry requirement.'
        )}
        <p class="mt-4 max-w-2xl text-[1.0625rem] leading-[1.6] text-(--color-ink-secondary)">
          The module you passed last year counts. So does the instrument you gave up at sixteen, the
          dish you cook every week, and the language your family speaks at home.
        </p>
        <div class="mt-8">
          <Button href="/signup" size="lg">List what you can teach <ArrowRight /></Button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <Card class="flex flex-col gap-4">
          <h3 class="text-title-sm text-(--color-ink-muted)">One listing is enough</h3>
          <div class="flex items-center gap-3">
            <Avatar name={jamie.name} size={44} />
            <div class="min-w-0 flex-1">
              <p class="truncate text-title-md text-(--color-ink)">{jamie.name}</p>
              <p class="truncate text-body-sm text-(--color-ink-muted)">{jamie.major}</p>
            </div>
            <Badge tone="emerald" size="sm">Teaches</Badge>
          </div>
          <div><SkillChip skill={jamieOffer} /></div>
          <p class="text-body-lg text-(--color-ink-secondary)">“{jamieOffer.description}”</p>
          <p class="border-t-[1.2px] border-(--color-line) pt-3 text-body-md text-(--color-ink-muted)">
            One skill listed, {jamie.hoursTaught}
            {jamie.hoursTaught === 1 ? 'hour' : 'hours'} taught, and on the teaching side of SkillSwap
            like everyone else.
          </p>
        </Card>

        <Card class="flex flex-col gap-4">
          <h3 class="text-title-sm text-(--color-ink-muted)">Your skill is probably rarer than you think</h3>
          <p class="text-[clamp(1.875rem,3.5vw,2.5rem)] leading-none font-black tracking-[-0.03em] text-(--color-ink)">
            {singleTeacherWants} of {wants.length}
          </p>
          <p class="text-body-lg text-(--color-ink-secondary)">
            requests on SkillSwap have exactly one student who can teach them. If you can teach it,
            there is a good chance you are the one.
          </p>
          <ul class="flex list-none flex-col divide-y-[1.2px] divide-(--color-line) border-y-[1.2px] border-(--color-line)">
            {#each scarce as [title, n] (title)}
              <li class="flex items-center justify-between gap-3 py-2.5">
                <span class="text-title-sm text-(--color-ink)">{title}</span>
                <span class="text-body-sm whitespace-nowrap text-(--color-ink-muted)">
                  {n} want it · 1 teaches it
                </span>
              </li>
            {/each}
          </ul>
          {#if unanswered.length}
            <p class="text-body-md text-(--color-ink-muted)">
              <span class="font-bold text-(--color-ink)">{unanswered.join(', ')}</span>
              {unanswered.length === 1 ? 'is' : 'are'} wanted, and nobody teaches
              {unanswered.length === 1 ? 'it' : 'them'} yet.
            </p>
          {/if}
        </Card>
      </div>
    </div>
  </section>

  <!-- --------------------------------------------------- how it clears -->
  <section
    id="how"
    aria-labelledby="how-title"
    class="scroll-mt-20 border-y-[1.2px] border-(--color-line) bg-(--color-elevated)/40"
  >
    <div class="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      {@render sectionHead(
        'how-title',
        'How it works',
        'You never have to find one perfect person.',
        'Straight barter needs two people who each want exactly what the other has. That rarely lines up, so every hour on SkillSwap has three ways to happen.'
      )}

      <ol class="mt-10 grid list-none gap-4 md:grid-cols-3">
        {#each mechanisms as m, i (m.title)}
          {@const Icon = m.icon}
          <li>
            <Card class="flex h-full flex-col gap-3 bg-(--color-card)">
              <div class="flex items-center justify-between">
                <span
                  class="grid size-11 place-items-center rounded-[var(--radius-button)] bg-(--color-primary)/12 text-(--color-primary)"
                >
                  <Icon class="size-5" aria-hidden="true" />
                </span>
                <span class="text-[0.75rem] font-bold tabular-nums text-(--color-ink-muted)">0{i + 1}</span>
              </div>
              <h3 class="mt-1 text-title-md text-(--color-ink)">{m.title}</h3>
              <p class="text-body-lg text-(--color-ink-secondary)">{m.body}</p>
              <p class="mt-auto border-t-[1.2px] border-(--color-line) pt-3 text-body-md text-(--color-ink-muted)">
                {m.detail}
              </p>
            </Card>
          </li>
        {/each}
      </ol>

      <Card class="mt-4 grid gap-6 bg-(--color-card) lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-10">
        <div>
          <h3 class="text-title-lg text-(--color-ink)">Karma is earned, never bought.</h3>
          <p class="mt-2 text-body-lg text-(--color-ink-secondary)">
            It is created when someone joins and changes hands when an hour is taught. Beyond
            lessons, it is good at {perks.length} places on campus, from {cheapestPerk} Karma.
          </p>
        </div>
        <ul class="grid list-none gap-2.5 sm:grid-cols-2">
          {#each perks as perk (perk.id)}
            <li
              class="flex items-center justify-between gap-3 rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) px-3.5 py-2.5"
            >
              <span class="text-body-md font-semibold text-(--color-ink)">{perk.title}</span>
              <KarmaBadge amount={perk.karmaCost} size="sm" glow={false} />
            </li>
          {/each}
        </ul>
      </Card>
    </div>
  </section>

  <!-- --------------------------------------------------------- reviews -->
  <section id="reviews" aria-labelledby="reviews-title" class="scroll-mt-20">
    <div class="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      {@render sectionHead(
        'reviews-title',
        'In their words',
        'What students said after the hour.',
        `Learners review their teacher after every session: ${reviews.length} reviews so far, averaging ${averageRating} out of 5. Here are four, quoted in full.`
      )}

      <ul class="mt-10 grid list-none gap-4 md:grid-cols-2">
        {#each featured as { review, teacher } (review.id)}
          <li>
            <Card class="h-full">
              <figure class="flex h-full flex-col gap-5">
                <div class="flex items-center justify-between gap-3">
                  <Quote class="size-6 text-(--color-primary)" aria-hidden="true" />
                  <RatingStars rating={review.rating} />
                </div>
                <blockquote
                  class="text-[1.1875rem] leading-[1.45] font-semibold tracking-[-0.01em] text-(--color-ink)"
                >
                  “{review.comment}”
                </blockquote>
                <figcaption
                  class="mt-auto flex items-center gap-3 border-t-[1.2px] border-(--color-line) pt-4"
                >
                  <Avatar name={review.reviewerName} size={36} />
                  <div class="min-w-0">
                    <p class="truncate text-title-sm text-(--color-ink)">{review.reviewerName}</p>
                    <p class="text-body-sm text-(--color-ink-muted)">
                      on {teacher.name}’s {review.skillName} session
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Card>
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <!-- ------------------------------------------------------------- join -->
  <section aria-labelledby="join-title" class="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 lg:pb-28">
    <div
      class="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-brand px-6 py-12 text-center text-white sm:px-12 sm:py-16 lg:py-20"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 [background:radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.22),transparent)]"
      ></div>
      <div class="relative mx-auto max-w-2xl">
        <h2 id="join-title" class="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.08] font-black tracking-[-0.03em]">
          Bring the one thing you know. Leave with the thing you don’t.
        </h2>
        <p class="mt-5 text-[1.0625rem] leading-[1.6] text-white">
          Your account starts with {KARMA.JOINING_GRANT} Karma, which is {freeHours} hours of learning
          before you have taught anyone anything. Teach one hour of what you already know, and the
          next hour is paid for.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/signup"
            class="inline-flex h-12 items-center gap-2 rounded-[var(--radius-button)] bg-white px-6 text-[0.9375rem] font-bold text-(--color-brand) transition-colors hover:bg-white/90 focus-visible:outline-white [&_svg]:size-5"
          >
            Create your free account <ArrowRight aria-hidden="true" />
          </a>
          <a
            href="/login"
            class="inline-flex h-12 items-center rounded-[var(--radius-button)] border-[1.2px] border-white/60 px-6 text-[0.9375rem] font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-white"
          >
            Sign in
          </a>
        </div>
        <p class="mt-5 text-body-md text-white">
          You will be asked what you can teach and what you want to learn. That is all.
        </p>
      </div>
    </div>
  </section>
</main>

<footer class="border-t-[1.2px] border-(--color-line) bg-(--color-card)">
  <div class="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
    <div class="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
      <div class="max-w-sm">
        <Brandmark />
        <p class="mt-4 text-body-lg text-(--color-ink-secondary)">
          A peer-to-peer skill exchange for students at {CAMPUS}. Knowledge is what gets traded, and
          Karma settles the trades that barter cannot.
        </p>
      </div>

      <nav aria-label="Footer" class="grid grid-cols-2 gap-x-14 gap-y-3">
        <div class="flex flex-col gap-3">
          <p class="text-[0.75rem] font-bold tracking-[0.08em] text-(--color-ink-muted) uppercase">Product</p>
          <ul class="flex list-none flex-col gap-2.5 text-[0.875rem] font-semibold">
            {#each navLinks as link (link.href)}
              <li>
                <a href={link.href} class="text-(--color-ink-secondary) hover:text-(--color-ink)">{link.label}</a>
              </li>
            {/each}
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <p class="text-[0.75rem] font-bold tracking-[0.08em] text-(--color-ink-muted) uppercase">Account</p>
          <ul class="flex list-none flex-col gap-2.5 text-[0.875rem] font-semibold">
            <li><a href="/signup" class="text-(--color-ink-secondary) hover:text-(--color-ink)">Create an account</a></li>
            <li><a href="/login" class="text-(--color-ink-secondary) hover:text-(--color-ink)">Sign in</a></li>
            <li><a href="/reset-password" class="text-(--color-ink-secondary) hover:text-(--color-ink)">Reset password</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <div
      class="mt-10 flex flex-col gap-5 border-t-[1.2px] border-(--color-line) pt-6 md:flex-row md:items-center md:justify-between"
    >
      <p class="max-w-3xl text-body-sm text-(--color-ink-muted)">
        Demo build. Every name, listing, review and figure on this page is read from the demo dataset
        that ships with this app. None of it is estimated or typed in by hand.
      </p>
      <ThemeSwitcher />
    </div>
  </div>
</footer>

<style>
  /* Hero entrance only. Visible by default; animation is opt-in for users
     who have not asked for reduced motion. */
  @media (prefers-reduced-motion: no-preference) {
    .enter {
      animation: enter 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
      animation-delay: var(--d, 0ms);
    }
  }
  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
</style>
