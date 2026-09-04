<script lang="ts">
  import { Check, ShieldCheck, X } from 'lucide-svelte';
  import { Avatar, Badge, Button, Card, Dialog, Tabs, Textarea, toasts } from '$shared/components/ui';
  import { EmptyState, SectionHeader } from '$shared/components/domain';
  import { reports } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';
  import type { Report } from '$shared/types';

  // Local resolutions layered over the fixtures so the queue is workable.
  let handled = $state<Record<string, 'resolved' | 'dismissed'>>({});
  // Explicit return type: without it the Record's value type narrows the
  // result to just the two handled states and every 'open' comparison fails.
  const statusOf = (r: Report): Report['status'] => handled[r.id] ?? r.status;

  let filter = $state<'open' | 'resolved' | 'dismissed' | 'all'>('open');
  const shown = $derived(
    filter === 'all' ? reports : reports.filter((r) => statusOf(r) === filter)
  );

  const counts = $derived({
    open: reports.filter((r) => statusOf(r) === 'open').length,
    resolved: reports.filter((r) => statusOf(r) === 'resolved').length,
    dismissed: reports.filter((r) => statusOf(r) === 'dismissed').length
  });

  const REASONS: Record<Report['reason'], string> = {
    harassment: 'Harassment',
    no_show: 'Did not turn up',
    spam: 'Spam or solicitation',
    misrepresented_skill: 'Misrepresented a skill',
    other: 'Other'
  };

  let actionOpen = $state(false);
  let target = $state<Report | null>(null);
  let action = $state<'resolved' | 'dismissed'>('resolved');
  let note = $state('');

  function open(r: Report, a: 'resolved' | 'dismissed') {
    target = r;
    action = a;
    note = '';
    actionOpen = true;
  }

  function confirm() {
    // TODO: convert to a form action (POST /moderation/[id]).
    if (target) handled = { ...handled, [target.id]: action };
    actionOpen = false;
    toasts.success(action === 'resolved' ? 'Report resolved.' : 'Report dismissed.');
  }
</script>

<svelte:head><title>Moderation · SkillSwap Admin</title></svelte:head>

<SectionHeader
  title="Moderation queue"
  subtitle="{counts.open} open. Every report is reviewed by a person."
/>

<Tabs
  tabs={[
    { value: 'open', label: 'Open', count: counts.open },
    { value: 'resolved', label: 'Resolved', count: counts.resolved },
    { value: 'dismissed', label: 'Dismissed', count: counts.dismissed },
    { value: 'all', label: 'All', count: reports.length }
  ]}
  bind:value={filter}
  class="mt-3"
/>

<div id="panel-{filter}" role="tabpanel" aria-labelledby="tab-{filter}" tabindex="-1" class="mt-4">
  {#if shown.length}
    <ul class="flex flex-col gap-3">
      {#each shown as r (r.id)}
        {@const s = statusOf(r)}
        <li>
          <Card class="flex flex-col gap-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <Avatar name={r.subjectName} size={40} />
                <div class="min-w-0">
                  <p class="text-title-sm text-(--color-ink)">
                    <a href="/users/{r.subjectId}" class="hover:underline">{r.subjectName}</a>
                  </p>
                  <p class="text-[0.75rem] text-(--color-ink-muted)">
                    Reported by
                    <a href="/users/{r.reporterId}" class="hover:underline">{r.reporterName}</a>
                    · {formatDate(r.createdAt)}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge tone="neutral" size="sm">{REASONS[r.reason]}</Badge>
                <Badge
                  tone={s === 'open' ? 'danger' : s === 'resolved' ? 'emerald' : 'neutral'}
                  size="sm"
                >
                  {s}
                </Badge>
              </div>
            </div>

            <p class="rounded-[var(--radius-input)] bg-(--color-elevated)/60 p-3.5 text-body-md leading-[1.45] text-(--color-ink-secondary)">
              {r.detail}
            </p>

            {#if r.resolutionNote && s !== 'open'}
              <p class="border-l-2 border-(--color-emerald) pl-3 text-[0.8125rem] text-(--color-ink-muted)">
                <strong class="font-bold text-(--color-ink-secondary)">Outcome:</strong>
                {r.resolutionNote}
              </p>
            {/if}

            {#if s === 'open'}
              <div class="flex flex-wrap gap-2 border-t-[1.2px] border-(--color-line) pt-3">
                <Button size="sm" onclick={() => open(r, 'resolved')}><Check /> Resolve</Button>
                <Button size="sm" variant="outline" onclick={() => open(r, 'dismissed')}>
                  <X /> Dismiss
                </Button>
                <Button size="sm" variant="ghost" href="/users/{r.subjectId}">
                  Review account
                </Button>
              </div>
            {/if}
          </Card>
        </li>
      {/each}
    </ul>
  {:else}
    <Card padded={false}>
      <EmptyState
        icon={ShieldCheck}
        title="Queue clear"
        body="No reports with that status. Reports arrive from the report button on a student's profile."
      />
    </Card>
  {/if}
</div>

<Dialog
  bind:open={actionOpen}
  title={action === 'resolved' ? 'Resolve report' : 'Dismiss report'}
  description="Recorded against the report and visible to other moderators."
  size="sm"
>
  <Textarea
    label="Outcome note"
    bind:value={note}
    rows={3}
    placeholder={action === 'resolved'
      ? 'What action was taken, and why.'
      : 'Why no action was needed.'}
  />
  {#snippet footer()}
    <Button variant="outline" onclick={() => (actionOpen = false)}>Cancel</Button>
    <Button variant={action === 'resolved' ? 'primary' : 'secondary'} disabled={!note.trim()} onclick={confirm}>
      {action === 'resolved' ? 'Resolve' : 'Dismiss'}
    </Button>
  {/snippet}
</Dialog>
