<script lang="ts">
  import { UserPlus } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Input } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { KARMA } from '$shared/mock';
  import { session } from '$lib/session.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let errors = $state<Record<string, string>>({});

  // TODO: convert to a form action (POST /signup).
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'We need something to call you.';
    if (!email.includes('@')) next.email = 'That does not look like an email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    errors = next;
    if (Object.keys(next).length) return;

    session.signIn();
    session.needsOnboarding = true;
    await goto('/onboarding');
  }
</script>

<svelte:head><title>Create an account · SkillSwap Campus</title></svelte:head>

<Card class="flex flex-col gap-5">
  <div>
    <h1 class="text-title-lg text-(--color-ink)">Create your account</h1>
    <p class="mt-1 flex flex-wrap items-center gap-1.5 text-body-md text-(--color-ink-muted)">
      You will start with <KarmaBadge amount={KARMA.JOINING_GRANT} size="sm" glow={false} /> Karma —
      enough for {Math.floor(KARMA.JOINING_GRANT / KARMA.PER_SESSION)} sessions before you teach anything.
    </p>
  </div>

  <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
    <Input label="Display name" autocomplete="name" bind:value={name} error={errors.name} />
    <Input
      label="University email"
      type="email"
      autocomplete="email"
      bind:value={email}
      error={errors.email}
      hint="We use this to verify you are a student."
    />
    <Input
      label="Password"
      type="password"
      autocomplete="new-password"
      bind:value={password}
      error={errors.password}
      hint="At least 8 characters."
    />
    <Button type="submit" full><UserPlus /> Create account</Button>
  </form>

  <p class="text-center text-[0.8125rem] text-(--color-ink-muted)">
    Already have one?
    <a href="/login" class="font-bold text-(--color-primary) hover:underline">Sign in</a>
  </p>
</Card>
