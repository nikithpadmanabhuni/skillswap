<script lang="ts">
  import { Download, Info, LogOut, Trash2, TriangleAlert } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Dialog, Input, Switch, toasts } from '$shared/components/ui';
  import { SectionHeader } from '$shared/components/domain';
  import { THEMES, THEME_LABELS, theme } from '$shared/theme.svelte';
  import { currentUser } from '$shared/mock';
  import { session } from '$lib/session.svelte';

  // Six toggles, matching the Flutter notification settings (spec 3.1, System).
  let prefs = $state({ ...currentUser.notificationSettings });

  let deleteOpen = $state(false);
  let confirmText = $state('');

  function signOut() {
    session.signOut();
    goto('/');
  }
</script>

<svelte:head><title>Settings · SkillSwap Campus</title></svelte:head>

<SectionHeader title="Settings" level={1} />

<div class="mt-3 flex flex-col gap-4">
  <Card class="flex flex-col gap-4">
    <h2 class="text-title-md text-(--color-ink)">Display</h2>
    <fieldset>
      <legend class="text-[0.875rem] font-semibold text-(--color-ink-secondary)">Theme</legend>
      <div class="mt-2 flex flex-wrap gap-2">
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
      <p class="mt-2 text-[0.75rem] text-(--color-ink-muted)">
        Night is true black, for OLED screens. Your choice is remembered on this device.
      </p>
    </fieldset>
  </Card>

  <Card class="flex flex-col gap-5">
    <div>
      <h2 class="text-title-md text-(--color-ink)">Notifications</h2>
      <!-- Honest about the current state: the toggles exist, nothing is wired to
           them. Spec 3.4 lists push and email delivery as work still to do. -->
      <p class="mt-1 flex items-start gap-2 text-[0.75rem] text-(--color-ink-muted)">
        <Info class="mt-0.5 size-3.5 shrink-0" />
        These preferences are stored but nothing delivers against them yet — push and email are not
        built.
      </p>
    </div>

    <Switch bind:checked={prefs.all} label="All notifications" description="The master switch." />
    <div
      class="flex flex-col gap-5 border-l-2 border-(--color-line) pl-4 {prefs.all
        ? ''
        : 'pointer-events-none opacity-45'}"
    >
      <Switch bind:checked={prefs.sessionReminders} label="Session reminders" description="An hour before a scheduled session." />
      <Switch bind:checked={prefs.karmaAlerts} label="Karma alerts" description="When Karma is credited or debited." />
      <Switch bind:checked={prefs.swapRequests} label="Swap requests" description="When someone proposes a swap." />
      <Switch bind:checked={prefs.emailDigest} label="Weekly email digest" description="New matches and mesh loops, once a week." />
      <Switch bind:checked={prefs.smsAlerts} label="SMS alerts" description="Text messages for time-critical reminders." />
    </div>

    <Button
      variant="outline"
      class="self-start"
      onclick={() => toasts.success('Notification preferences saved.')}
    >
      Save preferences
    </Button>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="text-title-md text-(--color-ink)">Privacy and your data</h2>
    <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">
      Other students see your name, campus, major, bio, skills, rating and hours. They never see
      your email address or phone number.
    </p>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onclick={() => toasts.success('Export requested. It will be emailed to you.')}>
        <Download /> Export my data
      </Button>
      <Button variant="outline" class="text-(--color-danger)" onclick={() => (deleteOpen = true)}>
        <Trash2 /> Delete account
      </Button>
    </div>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="text-title-md text-(--color-ink)">About</h2>
    <dl class="grid gap-2 text-[0.8125rem] sm:grid-cols-2">
      {#each [['Version', '1.0.0'], ['Campus', currentUser.campus], ['Signed in as', currentUser.email], ['Build', 'UI preview — no backend']] as [k, v] (k)}
        <div class="flex justify-between gap-3 sm:justify-start sm:gap-2">
          <dt class="text-(--color-ink-muted)">{k}</dt>
          <dd class="font-semibold text-(--color-ink)">{v}</dd>
        </div>
      {/each}
    </dl>
    <Button variant="outline" class="self-start" onclick={signOut}><LogOut /> Sign out</Button>
  </Card>
</div>

<Dialog bind:open={deleteOpen} title="Delete your account" size="sm">
  <div class="flex flex-col gap-4">
    <p class="flex items-start gap-2 text-body-md leading-[1.45] text-(--color-ink-secondary)">
      <TriangleAlert class="mt-0.5 size-4 shrink-0 text-(--color-danger)" />
      This removes your profile, skills, sessions and message history. Reviews you wrote about other
      people stay, anonymised. Your Karma is destroyed rather than returned to circulation.
    </p>
    <Input label="Type DELETE to confirm" bind:value={confirmText} />
  </div>
  {#snippet footer()}
    <Button variant="outline" onclick={() => (deleteOpen = false)}>Keep my account</Button>
    <Button
      variant="danger"
      disabled={confirmText !== 'DELETE'}
      onclick={() => {
        deleteOpen = false;
        signOut();
      }}
    >
      Delete permanently
    </Button>
  {/snippet}
</Dialog>
