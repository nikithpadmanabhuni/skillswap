<script lang="ts">
  import { ArrowLeft, Ban, CircleCheck, Mail, Phone, ShieldAlert } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Badge, Button, Card, Dialog, StatTile, Table, Textarea, toasts, type Column } from '$shared/components/ui';
  import { KarmaBadge, RatingStars, SectionHeader, SessionStatusPill, SkillChip } from '$shared/components/domain';
  import { getUser, ledgerFor, reports, reviewsFor, sessions } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';
  import type { Session } from '$shared/types';

  const user = $derived(getUser(page.params.id ?? ''));
  const theirSessions = $derived(
    user ? sessions.filter((s) => s.requesterId === user.id || s.providerId === user.id).slice(0, 12) : []
  );
  const ledger = $derived(user ? ledgerFor(user.id).slice(0, 10) : []);
  const theirReports = $derived(user ? reports.filter((r) => r.subjectId === user.id) : []);
  const reviews = $derived(user ? reviewsFor(user.id).slice(0, 5) : []);

  let suspendOpen = $state(false);
  let reason = $state('');
  let suspended = $state<boolean | null>(null);
  const isSuspended = $derived(suspended ?? user?.status === 'suspended');

  const sessionColumns: Column<Session>[] = [
    { key: 'skill', header: 'Skill' },
    { key: 'role', header: 'Role' },
    { key: 'peer', header: 'With' },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status' }
  ];
</script>

<svelte:head><title>{user?.name ?? 'User'} · SkillSwap Admin</title></svelte:head>

<a href="/users" class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)">
  <ArrowLeft class="size-4" /> Users
</a>

{#if !user}
  <Card class="text-center">
    <p class="text-body-lg">No such account.</p>
    <Button href="/users" variant="outline" class="mt-4">Back to users</Button>
  </Card>
{:else}
  <Card class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <Avatar name={user.name} size={64} />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-title-lg text-(--color-ink)">{user.name}</h1>
          <Badge tone={isSuspended ? 'danger' : 'emerald'} size="sm">
            {isSuspended ? 'suspended' : 'active'}
          </Badge>
          {#if theirReports.filter((r) => r.status === 'open').length}
            <Badge tone="danger" size="sm">
              <ShieldAlert />{theirReports.filter((r) => r.status === 'open').length} open reports
            </Badge>
          {/if}
        </div>
        <p class="mt-1 text-body-md text-(--color-ink-secondary)">
          {user.major} · {user.campus}
        </p>
        <!-- The admin view is the ONE place PII is legitimately shown. Peer-facing
             screens read the profiles projection, which has neither field. -->
        <dl class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-(--color-ink-muted)">
          <div class="inline-flex items-center gap-1.5">
            <Mail class="size-3.5" /><dt class="sr-only">Email</dt><dd>{user.email}</dd>
          </div>
          <div class="inline-flex items-center gap-1.5">
            <Phone class="size-3.5" /><dt class="sr-only">Phone</dt><dd>{user.phoneNumber}</dd>
          </div>
          <div>Joined {user.joinedAt ? formatDate(user.joinedAt) : '—'}</div>
        </dl>
      </div>

      <Button
        variant={isSuspended ? 'outline' : 'danger'}
        onclick={() => (isSuspended ? (suspended = false) : (suspendOpen = true))}
      >
        {#if isSuspended}<CircleCheck /> Reinstate{:else}<Ban /> Suspend{/if}
      </Button>
    </div>

    {#if user.bio}
      <p class="border-t-[1.2px] border-(--color-line) pt-4 text-body-md leading-[1.45] text-(--color-ink-secondary)">
        {user.bio}
      </p>
    {/if}
  </Card>

  <div class="mt-4 grid gap-3 sm:grid-cols-4">
    <StatTile label="Karma" value={user.karmaBalance} tone="karma" />
    <StatTile label="Taught" value="{user.hoursTaught}h" tone="emerald" />
    <StatTile label="Learned" value="{user.hoursLearned}h" tone="brand" />
    <StatTile label="Rating" value={user.reviewCount ? user.rating.toFixed(1) : '—'} sub="{user.reviewCount} reviews" />
  </div>

  <div class="mt-6 grid gap-6 lg:grid-cols-2">
    <section>
      <SectionHeader title="Teaches" />
      <div class="mt-2 flex flex-wrap gap-2">
        {#each user.skillsOffered as skill (skill.id)}<SkillChip {skill} />{/each}
      </div>
    </section>
    <section>
      <SectionHeader title="Wants to learn" />
      <div class="mt-2 flex flex-wrap gap-2">
        {#each user.skillsWanted as skill (skill.id)}<SkillChip {skill} />{:else}
          <p class="text-body-md text-(--color-ink-muted)">Nothing listed.</p>
        {/each}
      </div>
    </section>
  </div>

  {#if theirReports.length}
    <SectionHeader title="Reports against this account" class="mt-6" />
    <ul class="mt-2 flex flex-col gap-2">
      {#each theirReports as r (r.id)}
        <li>
          <Card class="flex flex-col gap-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[0.8125rem] font-bold text-(--color-ink)">
                {r.reason.replace(/_/g, ' ')} · reported by {r.reporterName}
              </span>
              <Badge
                tone={r.status === 'open' ? 'danger' : r.status === 'resolved' ? 'emerald' : 'neutral'}
                size="sm"
              >
                {r.status}
              </Badge>
            </div>
            <p class="text-body-md text-(--color-ink-secondary)">{r.detail}</p>
            <p class="text-[0.6875rem] text-(--color-ink-muted)">{formatDate(r.createdAt)}</p>
          </Card>
        </li>
      {/each}
    </ul>
  {/if}

  <SectionHeader title="Recent sessions" class="mt-6" />
  <Table
    columns={sessionColumns}
    rows={theirSessions}
    rowKey={(s) => s.id}
    caption="Recent sessions"
    empty="No sessions yet."
    class="mt-2"
  >
    {#snippet cell(s: Session, key: string)}
      {#if key === 'skill'}
        <span class="font-semibold text-(--color-ink)">{s.requestedSkillTitle}</span>
      {:else if key === 'role'}
        {s.providerId === user?.id ? 'Teaching' : 'Learning'}
      {:else if key === 'peer'}
        {s.providerId === user?.id ? s.studentName : s.teacherName}
      {:else if key === 'date'}
        {s.scheduledDateTime ? formatDate(s.scheduledDateTime) : '—'}
      {:else if key === 'status'}
        <SessionStatusPill status={s.status} size="sm" />
      {/if}
    {/snippet}
  </Table>

  <div class="mt-6 grid gap-6 lg:grid-cols-2">
    <section>
      <SectionHeader title="Recent Karma" />
      <ul class="mt-2 flex flex-col gap-1.5">
        {#each ledger as t (t.id)}
          <li class="flex items-center gap-3 rounded-[var(--radius-button)] border-[1.2px] border-(--color-line) bg-(--color-card) px-3 py-2">
            <span class="min-w-0 flex-1 truncate text-[0.8125rem] text-(--color-ink-secondary)">
              {t.title}
            </span>
            <span class="shrink-0 text-[0.6875rem] text-(--color-ink-muted)">
              {formatDate(t.timestamp)}
            </span>
            <KarmaBadge amount={t.amount} size="sm" glow={false} signed />
          </li>
        {/each}
      </ul>
    </section>

    <section>
      <SectionHeader title="Recent reviews" />
      <ul class="mt-2 flex flex-col gap-2">
        {#each reviews as r (r.id)}
          <li>
            <Card class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[0.8125rem] font-bold text-(--color-ink)">{r.skillName}</span>
                <RatingStars rating={r.rating} size={12} />
              </div>
              <p class="text-body-md text-(--color-ink-secondary)">{r.comment}</p>
              <p class="text-[0.6875rem] text-(--color-ink-muted)">
                {r.reviewerName} · {formatDate(r.createdAt)}
              </p>
            </Card>
          </li>
        {:else}
          <li class="text-body-md text-(--color-ink-muted)">No reviews yet.</li>
        {/each}
      </ul>
    </section>
  </div>

  <Dialog bind:open={suspendOpen} title="Suspend {user.name}" size="sm">
    <div class="flex flex-col gap-3">
      <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">
        They will be signed out, hidden from the match feed, and unable to propose or accept swaps.
        Existing sessions are left alone. Their Karma balance is untouched.
      </p>
      <Textarea label="Reason (recorded in the audit log)" bind:value={reason} rows={3} />
    </div>
    {#snippet footer()}
      <Button variant="outline" onclick={() => (suspendOpen = false)}>Cancel</Button>
      <Button
        variant="danger"
        disabled={!reason.trim()}
        onclick={() => {
          // TODO: convert to a form action (POST /users/[id]/suspend).
          suspended = true;
          suspendOpen = false;
          toasts.success('Account suspended.');
        }}
      >
        Suspend account
      </Button>
    {/snippet}
  </Dialog>
{/if}
