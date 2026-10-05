<script lang="ts">
  import { ArrowLeft, MailCheck, Send } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { Button, Input } from '$shared/components/ui';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let busy = $state(false);
</script>

<svelte:head><title>Reset password · SkillSwap Campus</title></svelte:head>

<div class="flex flex-col gap-7">
  {#if form?.success}
    <div class="flex flex-col items-center gap-4 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-(--color-emerald)/15 text-(--color-emerald)">
        <MailCheck class="size-6" aria-hidden="true" />
      </span>
      <h1 class="text-[1.875rem] leading-[1.15] font-black tracking-[-0.03em] text-(--color-ink)">
        Check your inbox
      </h1>
      <p class="text-body-lg text-(--color-ink-secondary)">
        If an account exists for <strong class="font-bold text-(--color-ink)">{form?.email || ''}</strong>, a
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
        value={form?.email ?? ''}
        error={form?.error}
      />
      <Button type="submit" size="lg" disabled={busy} full><Send /> Send reset link</Button>
    </form>

    <a
      href="/login"
      class="inline-flex items-center justify-center gap-2 text-[0.875rem] font-bold text-(--color-primary) hover:underline"
    >
      <ArrowLeft class="size-4" aria-hidden="true" /> Back to sign in
    </a>
  {/if}
</div>
