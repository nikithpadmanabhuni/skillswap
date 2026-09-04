<script lang="ts">
  import { MailCheck, Send } from 'lucide-svelte';
  import { Button, Card, Input } from '$shared/components/ui';

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

<Card class="flex flex-col gap-5">
  {#if sent}
    <div class="flex flex-col items-center gap-3 py-4 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-(--color-emerald)/15 text-(--color-emerald)">
        <MailCheck class="size-6" />
      </span>
      <h1 class="text-title-lg text-(--color-ink)">Check your inbox</h1>
      <p class="text-body-md text-(--color-ink-muted)">
        If an account exists for <strong class="font-bold text-(--color-ink)">{email}</strong>, a
        reset link is on its way. The link expires in an hour.
      </p>
      <Button href="/login" variant="outline" full>Back to sign in</Button>
    </div>
  {:else}
    <div>
      <h1 class="text-title-lg text-(--color-ink)">Reset your password</h1>
      <p class="mt-1 text-body-md text-(--color-ink-muted)">
        Enter your email and we will send you a link.
      </p>
    </div>

    <form onsubmit={submit} class="flex flex-col gap-4" novalidate>
      <Input
        label="Email"
        type="email"
        autocomplete="email"
        bind:value={email}
        error={error || undefined}
      />
      <Button type="submit" full><Send /> Send reset link</Button>
    </form>

    <p class="text-center text-[0.8125rem] text-(--color-ink-muted)">
      Remembered it?
      <a href="/login" class="font-bold text-(--color-primary) hover:underline">Sign in</a>
    </p>
  {/if}
</Card>
