<script lang="ts">
  import { Search, UserPlus } from 'lucide-svelte';
  import { Avatar, Badge, Button, Card, Dialog, Input, Pagination, Select, Table, toasts, type Column } from '$shared/components/ui';
  import { KarmaBadge, RatingStars, SectionHeader } from '$shared/components/domain';
  import { users } from '$shared/mock';
  import { CATEGORY_LABELS, SKILL_CATEGORIES, type User } from '$shared/types';
  import { formatDate } from '$shared/utils/format';

  let query = $state('');
  let status = $state<'all' | 'active' | 'suspended'>('all');
  let category = $state('all');
  let page = $state(1);
  const PER = 15;

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (status !== 'all' && u.status !== status) return false;
      if (category !== 'all' && !u.skillsOffered.some((s) => s.category === category)) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.major.toLowerCase().includes(q)
      );
    });
  });

  $effect(() => {
    void query;
    void status;
    void category;
    page = 1;
  });

  const rows = $derived(filtered.slice((page - 1) * PER, page * PER));

  const columns: Column<User>[] = [
    { key: 'name', header: 'Student' },
    { key: 'major', header: 'Course' },
    { key: 'skills', header: 'Skills', numeric: true },
    { key: 'taught', header: 'Taught', numeric: true },
    { key: 'rating', header: 'Rating' },
    { key: 'karma', header: 'Karma', numeric: true },
    { key: 'joined', header: 'Joined' },
    { key: 'status', header: 'Status' }
  ];

  let addOpen = $state(false);
  let newName = $state('');
  let newEmail = $state('');
  let newMajor = $state('');
</script>

<svelte:head><title>Users · SkillSwap Admin</title></svelte:head>

<SectionHeader title="Users" level={1} subtitle="{users.length} accounts on this campus.">
  {#snippet action()}
    <Button size="sm" onclick={() => (addOpen = true)}><UserPlus /> Add student</Button>
  {/snippet}
</SectionHeader>

<div class="mt-3 flex flex-col gap-3 sm:flex-row">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)" />
    <input
      type="search"
      bind:value={query}
      placeholder="Search name, email or course…"
      aria-label="Search users"
      class="w-full rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-2.5 pr-4 pl-10 text-[0.875rem] text-(--color-ink) outline-none placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
    />
  </div>
  <Select
    options={[
      { value: 'all', label: 'All statuses' },
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' }
    ]}
    bind:value={status}
    class="sm:w-44"
  />
  <Select
    options={[
      { value: 'all', label: 'All categories' },
      ...SKILL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))
    ]}
    bind:value={category}
    class="sm:w-52"
  />
</div>

<Table
  {columns}
  {rows}
  rowKey={(u) => u.id}
  caption="Student accounts"
  empty="No students match those filters."
  class="mt-4"
>
  {#snippet cell(u: User, key: string)}
    {#if key === 'name'}
      <span class="flex items-center gap-2.5">
        <Avatar name={u.name} size={30} />
        <span class="min-w-0">
          <a href="/users/{u.id}" class="block truncate font-bold text-(--color-ink) hover:underline">
            {u.name}
          </a>
          <span class="block truncate text-[0.6875rem] text-(--color-ink-muted)">{u.email}</span>
        </span>
      </span>
    {:else if key === 'major'}
      {u.major}
    {:else if key === 'skills'}
      {u.skillsOffered.length}/{u.skillsWanted.length}
    {:else if key === 'taught'}
      {u.hoursTaught}h
    {:else if key === 'rating'}
      {#if u.reviewCount}<RatingStars rating={u.rating} count={u.reviewCount} size={12} />{:else}—{/if}
    {:else if key === 'karma'}
      <KarmaBadge amount={u.karmaBalance} size="sm" glow={false} />
    {:else if key === 'joined'}
      {u.joinedAt ? formatDate(u.joinedAt) : '—'}
    {:else if key === 'status'}
      <Badge tone={u.status === 'suspended' ? 'danger' : 'emerald'} size="sm">
        {u.status}
      </Badge>
    {/if}
  {/snippet}
</Table>

{#if filtered.length > PER}
  <Pagination bind:page total={filtered.length} perPage={PER} label="students" class="mt-4" />
{/if}

<Dialog
  bind:open={addOpen}
  title="Add a student"
  description="For seeding a demo or onboarding someone who cannot sign up themselves."
>
  <div class="flex flex-col gap-4">
    <Input label="Name" bind:value={newName} />
    <Input label="University email" type="email" bind:value={newEmail} />
    <Input label="Course" bind:value={newMajor} />
  </div>
  {#snippet footer()}
    <Button variant="outline" onclick={() => (addOpen = false)}>Cancel</Button>
    <Button
      onclick={() => {
        // TODO: convert to a form action (POST /users).
        addOpen = false;
        toasts.success('Student created and sent a set-password email.');
      }}
    >
      Create account
    </Button>
  {/snippet}
</Dialog>
