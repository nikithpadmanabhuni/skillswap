<script lang="ts">
  import { ArrowLeft, Copy, Gift, ShieldCheck, Store } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Button, Card, toasts } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { currentUser, perks } from '$shared/mock';

  const perk = $derived(perks.find((p) => p.id === page.params.id));
  const affordable = $derived(perk ? currentUser.karmaBalance >= perk.karmaCost : false);
  const after = $derived(perk ? currentUser.karmaBalance - perk.karmaCost : 0);

  let redeemed = $state(false);

  /**
   * The issued code. Fixed rather than random so this page is reproducible.
   *
   * Spec 3.1 flagged that the Flutter app debited Karma and produced nothing a
   * vendor could honour. A redemption record with a verifiable code is the other
   * half of that: the admin panel's /redemptions screen is where a vendor's code
   * gets marked honoured. TODO: the real code is minted by the server action,
   * which also performs the debit in the same transaction.
   */
  const code = $derived(perk ? `NG-${perk.id.slice(-3).toUpperCase()}-DEMO` : '');

  function copy() {
    navigator.clipboard?.writeText(code).then(
      () => toasts.success('Code copied.'),
      () => toasts.error('Could not copy. Write it down instead.')
    );
  }
</script>

<svelte:head><title>Redeem · SkillSwap Campus</title></svelte:head>

<a
  href="/perks"
  class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
>
  <ArrowLeft class="size-4" /> Perks
</a>

<div class="mx-auto max-w-lg">
  {#if !perk}
    <Card class="text-center">
      <p class="text-body-lg">That perk does not exist.</p>
      <Button href="/perks" variant="outline" class="mt-4">Back to perks</Button>
    </Card>
  {:else if redeemed}
    <Card class="flex flex-col items-center gap-4 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-(--color-emerald)/15 text-(--color-emerald)">
        <ShieldCheck class="size-7" />
      </span>
      <div>
        <h1 class="text-title-lg text-(--color-ink)">Redeemed</h1>
        <p class="mt-1 text-body-md text-(--color-ink-muted)">
          Show this code at {perk.vendor}. It is recorded against your account, so they can verify
          it.
        </p>
      </div>

      <div class="w-full rounded-[var(--radius-input)] border-[1.2px] border-dashed border-(--color-line) bg-(--color-elevated)/50 p-5">
        <p class="text-[0.6875rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
          Redemption code
        </p>
        <p class="mt-1.5 font-mono text-[1.5rem] font-black tracking-wider text-(--color-ink)">
          {code}
        </p>
      </div>

      <div class="flex w-full gap-2">
        <Button variant="outline" class="flex-1" onclick={copy}><Copy /> Copy code</Button>
        <Button href="/karma" class="flex-1">View wallet</Button>
      </div>
    </Card>
  {:else}
    <Card class="flex flex-col gap-5">
      <div class="flex items-start gap-3">
        <span class="grid size-12 shrink-0 place-items-center rounded-[var(--radius-button)] bg-(--color-karma)/14 text-(--color-warning)">
          <Gift class="size-5" />
        </span>
        <div class="min-w-0">
          <h1 class="text-title-lg text-(--color-ink)">{perk.title}</h1>
          <p class="mt-1 text-body-md text-(--color-ink-muted)">{perk.description}</p>
        </div>
      </div>

      <p class="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-(--color-ink-secondary)">
        <Store class="size-4 text-(--color-ink-muted)" /> Honoured by {perk.vendor}
      </p>

      <dl class="flex flex-col gap-2 border-t-[1.2px] border-(--color-line) pt-4 text-[0.875rem]">
        <div class="flex items-center justify-between">
          <dt class="text-(--color-ink-muted)">Your balance</dt>
          <dd><KarmaBadge amount={currentUser.karmaBalance} size="sm" glow={false} /></dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="text-(--color-ink-muted)">Cost</dt>
          <dd><KarmaBadge amount={-perk.karmaCost} size="sm" glow={false} signed /></dd>
        </div>
        <div class="flex items-center justify-between border-t-[1.2px] border-(--color-line) pt-2 font-bold">
          <dt class="text-(--color-ink)">Balance after</dt>
          <dd class="tabular-nums {affordable ? 'text-(--color-ink)' : 'text-(--color-danger)'}">
            {after}
          </dd>
        </div>
      </dl>

      {#if !affordable}
        <p class="rounded-[var(--radius-input)] border-[1.2px] border-(--color-danger)/40 bg-(--color-danger)/8 px-4 py-3 text-[0.8125rem] font-semibold text-(--color-danger)" role="alert">
          You are {perk.karmaCost - currentUser.karmaBalance} Karma short. Teach a session to earn more.
        </p>
      {/if}

      <div class="flex gap-2">
        <Button variant="outline" href="/perks" class="flex-1">Cancel</Button>
        <Button
          class="flex-1"
          variant="karma"
          disabled={!affordable}
          onclick={() => {
            // TODO: convert to a form action. Affordability check, debit and the
            // redemption record must happen in ONE server transaction.
            redeemed = true;
          }}
        >
          Redeem for {perk.karmaCost}
        </Button>
      </div>
    </Card>
  {/if}
</div>
