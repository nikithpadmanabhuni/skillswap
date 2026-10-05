<script lang="ts">
  import { Info, LogIn } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { Button, Input, toasts } from '$shared/components/ui';
  import { currentUser } from '$shared/mock';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let busy = $state(false);

  // In a real app we'd use Google provider from firebase/auth
  function continueWithGoogle() {
    toasts.success('Google sign-in is mocked in this demo.');
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

  <form
    method="POST"
    use:enhance={() => {
      busy = true;
      return async ({ update }) => {
        busy = false;
        await update();
      };
    }}
    class="flex flex-col gap-4"
    novalidate
  >
    <Input
      label="University email"
      name="email"
      type="email"
      autocomplete="email"
      value={form?.email ?? currentUser.email}
    />
    <div class="flex flex-col gap-2">
      <Input
        label="Password"
        name="password"
        type="password"
        autocomplete="current-password"
        error={form?.error}
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
