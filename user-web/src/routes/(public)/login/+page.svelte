<script lang="ts">
  import { Info, LogIn } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Input, toasts } from '$shared/components/ui';
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
      // Stays on /login and reports the failure. It does not navigate, and it
      // does not say which of the two fields was wrong.
      error = 'That email and password do not match.';
      return;
    }

    session.signIn();
    toasts.success(`Welcome back, ${currentUser.name.split(' ')[0]}.`);
    await goto('/explore');
  }

  function continueWithGoogle() {
    session.signIn();
    goto('/explore');
  }
</script>

<svelte:head><title>Sign in · SkillSwap Campus</title></svelte:head>

<div class="flex flex-col gap-7">
  <div>
    <h1 class="text-[1.875rem] leading-[1.15] font-black tracking-[-0.03em] text-(--color-ink)">
      Welcome back
    </h1>
    <p class="mt-2 text-body-lg text-(--color-ink-secondary)">
      Sign in to pick up your sessions, messages and Karma.
    </p>
  </div>

  <div
    role="note"
    class="flex items-start gap-3 rounded-[var(--radius-input)] border-[1.2px] border-(--color-brand)/30 bg-(--color-brand)/8 p-3.5"
  >
    <Info class="mt-0.5 size-4 shrink-0 text-(--color-primary)" aria-hidden="true" />
    <p class="text-body-md text-(--color-ink-secondary)">
      <span class="font-bold text-(--color-ink)">Demo build.</span> Sign in with the email below and
      the password
      <code class="rounded-md bg-(--color-elevated) px-1.5 py-0.5 font-mono text-[0.8125rem] font-bold text-(--color-ink)">demo</code>.
    </p>
  </div>

  <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
    <Input label="University email" type="email" autocomplete="email" bind:value={email} />
    <div class="flex flex-col gap-2">
      <Input
        label="Password"
        type="password"
        autocomplete="current-password"
        bind:value={password}
        error={error || undefined}
      />
      <a
        href="/reset-password"
        class="self-end text-[0.8125rem] font-bold text-(--color-primary) hover:underline"
      >
        Forgot password?
      </a>
    </div>

    <Button type="submit" size="lg" full disabled={busy}>
      <LogIn /> Sign in
    </Button>
  </form>

  <div class="flex items-center gap-3">
    <span class="h-px flex-1 bg-(--color-line)"></span>
    <span class="text-[0.75rem] font-bold text-(--color-ink-muted)">OR</span>
    <span class="h-px flex-1 bg-(--color-line)"></span>
  </div>

  <Button variant="outline" size="lg" full onclick={continueWithGoogle}>Continue with Google</Button>

  <p class="text-center text-[0.875rem] text-(--color-ink-muted)">
    New to SkillSwap?
    <a href="/signup" class="font-bold text-(--color-primary) hover:underline">Create a free account</a>
  </p>
</div>
