<script lang="ts">
  import { LogIn } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Input, toasts } from '$shared/components/ui';
  import { session } from '$lib/session.svelte';
  import { currentUser } from '$shared/mock';

  let email = $state(currentUser.email);
  let password = $state('');
  let error = $state('');
  let busy = $state(false);

  /**
   * TODO: convert to a form action (POST /login) once there is a server.
   *
   * This is the exact flow audit P0-1 was about: the Flutter app caught the
   * FirebaseAuthException, fabricated a local user, and navigated into the app
   * regardless — so any wrong password granted access. The demo credential is
   * printed below rather than accepted silently, and anything else is refused.
   */
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    error = '';

    if (!email.trim()) return (error = 'Enter your email address.');
    if (!password) return (error = 'Enter your password.');

    busy = true;
    if (password !== 'demo') {
      busy = false;
      // Stays on /login and reports the failure. It does not navigate.
      error = 'That password is not correct.';
      return;
    }

    session.signIn();
    toasts.success(`Welcome back, ${currentUser.name.split(' ')[0]}.`);
    await goto('/explore');
  }
</script>

<svelte:head><title>Sign in · SkillSwap Campus</title></svelte:head>

<Card class="flex flex-col gap-5">
  <div>
    <h1 class="text-title-lg text-(--color-ink)">Sign in</h1>
    <p class="mt-1 text-body-md text-(--color-ink-muted)">
      Welcome back. Your Karma is where you left it.
    </p>
  </div>

  <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
    <Input label="Email" type="email" autocomplete="email" bind:value={email} />
    <Input
      label="Password"
      type="password"
      autocomplete="current-password"
      bind:value={password}
      error={error || undefined}
      hint="Demo password: demo"
    />

    <div class="flex justify-end">
      <a href="/reset-password" class="text-[0.8125rem] font-bold text-(--color-primary) hover:underline">
        Forgot password?
      </a>
    </div>

    <Button type="submit" full disabled={busy}>
      <LogIn /> Sign in
    </Button>
  </form>

  <div class="flex items-center gap-3">
    <span class="h-px flex-1 bg-(--color-line)"></span>
    <span class="text-[0.75rem] font-bold text-(--color-ink-muted)">OR</span>
    <span class="h-px flex-1 bg-(--color-line)"></span>
  </div>

  <Button
    variant="outline"
    full
    onclick={() => {
      session.signIn();
      goto('/explore');
    }}
  >
    Continue with Google
  </Button>

  <p class="text-center text-[0.8125rem] text-(--color-ink-muted)">
    No account?
    <a href="/signup" class="font-bold text-(--color-primary) hover:underline">Create one</a>
  </p>
</Card>
