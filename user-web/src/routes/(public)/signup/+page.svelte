<script lang="ts">
  import { UserPlus } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Input } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { KARMA } from '$shared/mock';
  import { session } from '$lib/session.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let errors = $state<Record<string, string>>({});

  const freeHours = Math.floor(KARMA.JOINING_GRANT / KARMA.PER_SESSION);

  const nextSteps = [
    {
      title: 'Tell us one thing you can teach.',
      body: 'One step ahead of somebody is enough. Chess openings count.'
    },
    {
      title: 'Pick what you want to learn.',
      body: 'You will see who teaches it, and who wants what you know.'
    },
    {
      title: 'Propose your first swap.',
      body: `Your ${KARMA.JOINING_GRANT} Karma covers the hour, and ${freeHours - 1} more after that.`
    }
  ];

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    errors = {};
    if (!name.trim()) errors.name = 'We need something to call you.';
    if (!email.includes('@')) errors.email = 'Use your university address.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (Object.keys(errors).length > 0) return;

    session.signIn();
    session.needsOnboarding = true;
    await goto('/onboarding');
  }
</script>

<svelte:head><title>Create an account · SkillSwap Campus</title></svelte:head>

<div class="flex flex-col gap-7">
  <div>
    <h1 class="text-[1.875rem] leading-[1.15] font-black tracking-[-0.03em] text-(--color-ink)">
      Create your account
    </h1>
    <p class="mt-3 flex items-center gap-2.5 text-body-lg text-(--color-ink-secondary)">
      <KarmaBadge amount={KARMA.JOINING_GRANT} size="sm" glow={false} class="shrink-0" />
      <span>Karma on joining: {freeHours} hours of learning before you teach anything.</span>
    </p>
  </div>

  <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
    <Input label="Full name" autocomplete="name" bind:value={name} error={errors.name} />
    <Input
      label="University email"
      type="email"
      autocomplete="email"
      bind:value={email}
      error={errors.email}
      hint="Use your university address."
    />
    <Input
      label="Password"
      type="password"
      autocomplete="new-password"
      bind:value={password}
      error={errors.password}
      hint="At least 8 characters."
    />
    <Button type="submit" size="lg" full><UserPlus /> Create account</Button>
  </form>

  <section
    aria-labelledby="next-title"
    class="rounded-[var(--radius-card)] border-[1.2px] border-(--color-line) bg-(--color-card) p-5"
  >
    <h2 id="next-title" class="text-title-sm text-(--color-ink)">What happens next</h2>
    <ol class="mt-4 flex list-none flex-col gap-4">
      {#each nextSteps as step, i (step.title)}
        <li class="flex items-start gap-3">
          <span
            class="grid size-6 shrink-0 place-items-center rounded-full bg-(--color-primary)/12 text-[0.75rem] font-bold text-(--color-primary)"
          >
            {i + 1}
          </span>
          <p class="text-body-md text-(--color-ink-muted)">
            <span class="font-bold text-(--color-ink)">{step.title}</span>
            {step.body}
          </p>
        </li>
      {/each}
    </ol>
  </section>

  <p class="text-center text-[0.875rem] text-(--color-ink-muted)">
    Already have an account?
    <a href="/login" class="font-bold text-(--color-primary) hover:underline">Sign in</a>
  </p>
</div>
