<script lang="ts">
  import { ArrowRight, Repeat, Sparkles, Triangle, Zap } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { KARMA, totals } from '$shared/mock';
  import { session } from '$lib/session.svelte';

  // Spec 5.2: "/ — marketing/landing; redirects to /explore if signed in".
  $effect(() => {
    if (session.signedIn) goto('/explore', { replaceState: true });
  });

  const mechanisms = [
    {
      icon: Repeat,
      title: 'Direct mutual swap',
      body: 'You teach them, they teach you. No currency changes hands. Ideal, and rare.',
      when: 'Both of you want what the other offers.'
    },
    {
      icon: Zap,
      title: 'Karma-settled swap',
      body: `Teach a session, earn ${KARMA.PER_SESSION} Karma. Spend it later learning from someone else entirely.`,
      when: 'One-sided want. This is the common case.'
    },
    {
      icon: Triangle,
      title: '3-way circular mesh',
      body: 'You teach B, B teaches C, C teaches you. A closed loop that clears with no currency at all.',
      when: 'No pair matches, but a triangle does.'
    }
  ];
</script>

<main id="main" class="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
  <header class="max-w-2xl">
    <span
      class="inline-flex items-center gap-2 rounded-full border-[1.2px] border-(--color-line) bg-(--color-card) px-3 py-1.5 text-[0.75rem] font-bold text-(--color-ink-secondary)"
    >
      <Sparkles class="size-3.5 text-(--color-primary)" />
      {totals.activeUsers} students trading right now
    </span>

    <h1 class="mt-6 text-[clamp(2rem,6vw,3.25rem)] leading-[1.05] font-black tracking-[-0.035em] text-(--color-ink)">
      Trade what you know for what you want to learn.
    </h1>

    <p class="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-(--color-ink-secondary)">
      A computer science student who wants to play guitar sits fifty metres from a music student who
      wants to learn Python, and neither knows the other exists. SkillSwap finds the trade.
    </p>

    <div class="mt-8 flex flex-wrap items-center gap-3">
      <Button href="/signup" size="lg">Create an account <ArrowRight /></Button>
      <Button href="/login" size="lg" variant="outline">Sign in</Button>
    </div>

    <p class="mt-4 flex items-center gap-2 text-[0.8125rem] text-(--color-ink-muted)">
      New accounts start with
      <KarmaBadge amount={KARMA.JOINING_GRANT} size="sm" glow={false} /> Karma.
    </p>
  </header>

  <section class="mt-16" aria-labelledby="how">
    <h2 id="how" class="text-title-lg text-(--color-ink)">
      The problem is the double coincidence of wants
    </h2>
    <p class="mt-2 max-w-2xl text-body-lg text-(--color-ink-secondary)">
      For two people to barter directly, each has to want exactly what the other offers. On a campus
      of a few thousand, that almost never happens. There are three ways out, in ascending order of
      sophistication.
    </p>

    <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each mechanisms as m (m.title)}
        {@const Icon = m.icon}
        <Card class="flex flex-col gap-3">
          <span class="grid size-11 place-items-center rounded-[var(--radius-button)] bg-(--color-primary)/12 text-(--color-primary)">
            <Icon class="size-5" />
          </span>
          <h3 class="text-title-md text-(--color-ink)">{m.title}</h3>
          <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">{m.body}</p>
          <p class="mt-auto border-t-[1.2px] border-(--color-line) pt-3 text-[0.75rem] font-semibold text-(--color-ink-muted)">
            {m.when}
          </p>
        </Card>
      {/each}
    </div>
  </section>

  <footer class="mt-16 border-t-[1.2px] border-(--color-line) pt-6 text-[0.8125rem] text-(--color-ink-muted)">
    SkillSwap Campus — a peer-to-peer skill exchange for students.
  </footer>
</main>
