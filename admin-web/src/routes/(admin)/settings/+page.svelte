<script lang="ts">
  import { Info, Save, TriangleAlert } from 'lucide-svelte';
  import { Button, Card, Input, Switch, toasts } from '$shared/components/ui';
  import { KarmaBadge, SectionHeader } from '$shared/components/domain';
  import { THEMES, THEME_LABELS, theme } from '$shared/theme.svelte';
  import { CAMPUS, KARMA, karmaHealth, totals } from '$shared/mock';
  import { CATEGORY_LABELS, SKILL_CATEGORIES } from '$shared/types';

  // Spec 4.4 decision 1: "Fix one number in one server config." This screen is
  // the UI for that config; today the values live in shared/lib/mock/constants.
  let joiningGrant = $state(String(KARMA.JOINING_GRANT));
  let perSession = $state(String(KARMA.PER_SESSION));
  let campus = $state(CAMPUS);
  let multiCampus = $state(false);
  let autoModeration = $state(false);
  let requireVerifiedEmail = $state(true);
  let meshEnabled = $state(true);
  let videoEnabled = $state(false);
  let assistantEnabled = $state(false);

  // Changing the grant re-prices the whole economy, so show the consequence.
  const projectedSupply = $derived(
    totals.users * (Number(joiningGrant) || 0) - karmaHealth.redeemedTotal
  );
  const changed = $derived(Number(joiningGrant) !== KARMA.JOINING_GRANT);
</script>

<svelte:head><title>Settings · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Settings" subtitle="Platform configuration for {CAMPUS}." />

<div class="mt-3 flex max-w-3xl flex-col gap-4">
  <Card class="flex flex-col gap-4">
    <div>
      <h2 class="text-title-md text-(--color-ink)">Karma constants</h2>
      <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-secondary)">
        One definition, used everywhere. The Flutter app's marketing copy claimed 50 per hour and
        100 per mesh while the code awarded 10 and 10 — screens disagreeing about the price of a
        session is how a currency loses credibility.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Input
        label="Joining grant"
        type="number"
        min="0"
        bind:value={joiningGrant}
        hint="Credited once, at signup. The only source of new Karma."
      />
      <Input
        label="Per session"
        type="number"
        min="1"
        bind:value={perSession}
        hint="Credited to the teacher, debited from the learner."
      />
    </div>

    {#if changed}
      <p class="flex items-start gap-2 rounded-[var(--radius-input)] border-[1.2px] border-(--color-karma)/40 bg-(--color-karma)/10 p-3.5 text-body-md text-(--color-ink-secondary)">
        <TriangleAlert class="mt-0.5 size-4 shrink-0 text-(--color-warning)" />
        <span>
          Changing the joining grant re-prices the economy. With {totals.users} accounts, supply
          would move from {karmaHealth.totalSupply} to roughly {projectedSupply}. Existing balances
          are not retroactively adjusted.
        </span>
      </p>
    {/if}

    <p class="flex flex-wrap items-center gap-2 text-body-md text-(--color-ink-secondary)">
      A new student can currently afford
      <KarmaBadge amount={Number(joiningGrant) || 0} size="sm" glow={false} />
      — {Math.floor((Number(joiningGrant) || 0) / (Number(perSession) || 1))} sessions before they teach anything.
    </p>

    <Button class="self-start" onclick={() => toasts.success('Karma constants saved.')}>
      <Save /> Save constants
    </Button>
  </Card>

  <Card class="flex flex-col gap-5">
    <div>
      <h2 class="text-title-md text-(--color-ink)">Campus</h2>
      <p class="mt-1 text-body-md text-(--color-ink-secondary)">
        Single-campus today. Multi-campus changes the data model and every query, so it is a
        deliberate migration rather than a toggle.
      </p>
    </div>
    <Input label="Campus name" bind:value={campus} />
    <Switch
      bind:checked={multiCampus}
      label="Multi-campus mode"
      description="Not implemented. Enabling this would require a data migration."
      disabled
    />
    <Switch
      bind:checked={requireVerifiedEmail}
      label="Require a verified university email"
      description="Students cannot propose or accept swaps until their address is confirmed."
    />
  </Card>

  <Card class="flex flex-col gap-5">
    <div>
      <h2 class="text-title-md text-(--color-ink)">Features</h2>
      <!-- Honest defaults: the two prototype screens are off, and the labels say
           what turning them on would actually require. -->
      <p class="mt-1 flex items-start gap-2 text-[0.75rem] text-(--color-ink-muted)">
        <Info class="mt-0.5 size-3.5 shrink-0" />
        Video and the assistant are UI prototypes in this build. The toggles below describe what
        enabling them would require, and do not turn anything on.
      </p>
    </div>
    <Switch bind:checked={meshEnabled} label="3-way skill mesh" description="Circular triangle discovery and the Smart Lab." />
    <Switch
      bind:checked={videoEnabled}
      label="In-app video calling"
      description="Needs a LiveKit or Agora integration, server-side token minting and TURN configuration — roughly one to two weeks."
      disabled
    />
    <Switch
      bind:checked={assistantEnabled}
      label="AI assistant"
      description="Needs a server route proxying the Claude API with rate limiting and cost controls — roughly three to five days, plus ongoing token cost."
      disabled
    />
    <Switch
      bind:checked={autoModeration}
      label="Automated moderation triage"
      description="Auto-flag repeat reports. Human review is still required before any suspension."
    />
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="text-title-md text-(--color-ink)">Skill categories</h2>
    <p class="text-body-md text-(--color-ink-secondary)">
      Seven fixed categories. Adding one affects matching, filters and every existing skill record.
    </p>
    <ul class="flex flex-wrap gap-2">
      {#each SKILL_CATEGORIES as c (c)}
        <li class="rounded-[var(--radius-chip)] border-[1.2px] border-(--color-line) bg-(--color-elevated) px-3 py-1.5 text-[0.75rem] font-bold text-(--color-ink-secondary)">
          {CATEGORY_LABELS[c]}
        </li>
      {/each}
    </ul>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="text-title-md text-(--color-ink)">Appearance</h2>
    <div class="flex flex-wrap gap-2">
      {#each THEMES as t (t)}
        <button
          type="button"
          onclick={() => theme.set(t)}
          aria-pressed={theme.current === t}
          class="rounded-[var(--radius-button)] border-[1.2px] px-4 py-2.5 text-[0.875rem] font-bold transition-colors {theme.current ===
          t
            ? 'border-(--color-primary) bg-(--color-primary) text-white'
            : 'border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
        >
          {THEME_LABELS[t]}
        </button>
      {/each}
    </div>
  </Card>
</div>
