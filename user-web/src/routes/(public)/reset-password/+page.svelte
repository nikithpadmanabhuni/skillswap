<script lang="ts">
  import { ArrowLeft, MailCheck, Send } from 'lucide-svelte';
  import { Button, Input } from '$shared/components/ui';

  let email = $state('');
  let sent = $state(false);
  let error = $state('');

  // Password reset did not exist in the Flutter app at all (spec 3.1, "missing
  // today and required"). TODO: convert to a form action.
  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!email.includes('@')) return (error = 'Enter the email you signed up with.');
    error = '';
    sent = true;
  }
</script>

<svelte:head><title>Reset password · SkillSwap Campus</title></svelte:head>

<div class="flex flex-col gap-7">
  {#if sent}
    <div class="flex flex-col items-center gap-4 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-(--color-emerald)/15 text-(--color-emerald)">
        <MailCheck class="size-6" aria-hidden="true" />
      </span>
      <h1 class="text-[1.875rem] leading-[1.15] font-black tracking-[-0.03em] text-(--color-ink)">
        Check your inbox
      </h1>
      <p class="text-body-lg text-(--color-ink-secondary)">
        If an account exists for <strong class="font-bold text-(--color-ink)">{email}</strong>, a
        link to choose a new password is on its way. For your security it expires in an hour.
      </p>
      <p class="text-body-sm text-(--color-ink-muted)">Demo build: no email is actually sent.</p>
      <Button href="/login" variant="outline" size="lg" full>Back to sign in</Button>
    </div>
  {:else}
    <div>
      <h1 class="text-[1.875rem] leading-[1.15] font-black tracking-[-0.03em] text-(--color-ink)">
        Reset your password
      </h1>
      <p class="mt-2 text-body-lg text-(--color-ink-secondary)">
        Enter the email you signed up with and we will send you a link to choose a new password.
      </p>
    </div>

    <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
      <Input
        label="University email"
        type="email"
        autocomplete="email"
        bind:value={email}
        error={error || undefined}
      />
      <Button type="submit" size="lg" full><Send /> Send reset link</Button>
    </form>

    <a
      href="/login"
      class="inline-flex items-center justify-center gap-2 text-[0.875rem] font-bold text-(--color-primary) hover:underline"
    >
      <ArrowLeft class="size-4" aria-hidden="true" /> Back to sign in
    </a>
  {/if}
</div>
