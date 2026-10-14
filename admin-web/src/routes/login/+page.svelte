<script lang="ts">
  import { LogIn, ShieldCheck, Sparkles } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Input } from '$shared/components/ui';
  import { admin } from '$lib/session.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  let email = $state(admin.email);
  let password = $state('demo');
  let error = $state('');

  function fillDemo() {
    email = admin.email;
    password = 'demo';
    error = '';
  }

  // TODO: convert to a form action. A real admin sign-in must verify a session
  // cookie AND an administrator role claim server-side; neither is possible here.
  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (password !== 'demo') {
      error = 'That password is not correct.';
      return;
    }
    admin.signIn();
    goto('/');
  }
</script>

<div class="flex min-h-dvh flex-col">
  <header class="flex items-center justify-between px-5 py-4 sm:px-8">
    <span class="inline-flex items-center gap-2 text-[0.875rem] font-bold text-(--color-ink-secondary)">
      <ShieldCheck class="size-4 text-(--color-primary)" /> SkillSwap Admin
    </span>
    <ThemeSwitcher />
  </header>

  <main id="main" class="flex flex-1 items-center justify-center px-5 pb-16">
    <Card class="w-full max-w-sm">
      <h1 class="text-title-lg text-(--color-ink)">Administrator sign in</h1>
      <p class="mt-1 text-body-md text-(--color-ink-muted)">
        This panel manages the Karma ledger, perks and moderation for
        Northgate University.
      </p>

      <div class="mt-4 flex items-center justify-between rounded-[var(--radius-input)] border-[1.2px] border-(--color-brand)/30 bg-(--color-brand)/8 p-2.5 px-3">
        <span class="text-[0.8125rem] text-(--color-ink-secondary)">Demo password: <code class="font-bold text-(--color-ink)">demo</code></span>
        <Button type="button" variant="ghost" size="sm" onclick={fillDemo} class="h-7 px-2 text-[0.75rem] gap-1">
          <Sparkles class="size-3 text-(--color-primary)" /> Auto-fill
        </Button>
      </div>

      <form onsubmit={submit} class="mt-4 flex flex-col gap-4" novalidate>
        <Input label="Email" type="email" autocomplete="email" bind:value={email} />
        <Input
          label="Password"
          type="password"
          autocomplete="current-password"
          bind:value={password}
          error={error || undefined}
          hint="Demo password: demo"
        />
        <Button type="submit" full><LogIn /> Sign in</Button>
      </form>
    </Card>
  </main>
</div>
