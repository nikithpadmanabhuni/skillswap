<script lang="ts">
  import { Compass, Search, SlidersHorizontal, X } from 'lucide-svelte';
  import { Button, Card, Pagination, Sheet } from '$shared/components/ui';
  import { EmptyState, MatchCard, SectionHeader } from '$shared/components/domain';
  import { CATEGORY_LABELS, SKILL_CATEGORIES, type SkillCategory } from '$shared/types';
  import { PAGE_SIZE, getProfile, matches, mutualMatches } from '$shared/mock';

  let query = $state('');
  let category = $state<SkillCategory | 'all'>('all');
  let mutualOnly = $state(false);
  let page = $state(1);
  let filtersOpen = $state(false);

  /**
   * Search spans peer name, campus, skill title and skill description — the same
   * four fields the Flutter explore screen searched (spec 3.1).
   */
  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();

    return matches.filter((m) => {
      if (mutualOnly && !m.isMutual) return false;

      const peer = getProfile(m.targetUserId);
      if (!peer) return false;

      if (category !== 'all') {
        const inCategory = [...peer.skillsOffered, ...peer.skillsWanted].some(
          (s) => s.category === category
        );
        if (!inCategory) return false;
      }

      if (!q) return true;
      return (
        peer.name.toLowerCase().includes(q) ||
        peer.campus.toLowerCase().includes(q) ||
        peer.major.toLowerCase().includes(q) ||
        peer.skillsOffered.some(
          (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
      );
    });
  });

  // Spec 4.5: the match feed paginates at 20.
  const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

  // Any filter change puts you back on page 1, or you land on an empty page.
  $effect(() => {
    void query;
    void category;
    void mutualOnly;
    page = 1;
  });
  $effect(() => {
    if (page > pageCount) page = pageCount;
  });

  const activeFilters = $derived((category !== 'all' ? 1 : 0) + (mutualOnly ? 1 : 0));
  const reset = () => {
    category = 'all';
    mutualOnly = false;
    query = '';
  };
</script>

<svelte:head><title>Explore · SkillSwap Campus</title></svelte:head>

<SectionHeader
  title="Explore" level={1}
  subtitle="{matches.length} people match your skills — {mutualMatches.length} of them mutually."
/>

<div class="mt-4 flex flex-col gap-3">
  <div class="flex gap-2">
    <div class="relative flex-1">
      <Search
        class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-ink-muted)"
      />
      <input
        type="search"
        bind:value={query}
        placeholder="Search people, skills, campus…"
        aria-label="Search people and skills"
        class="w-full rounded-[var(--radius-input)] border-[1.2px] border-(--color-line) bg-(--color-card) py-3 pr-4 pl-10 text-[0.9375rem] font-medium text-(--color-ink) outline-none placeholder:font-normal placeholder:text-(--color-hint) focus:border-2 focus:border-(--color-primary)"
      />
    </div>
    <Button variant="outline" size="icon" onclick={() => (filtersOpen = true)} class="relative md:hidden">
      <SlidersHorizontal />
      <span class="sr-only">Filters</span>
      {#if activeFilters}
        <span class="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-(--color-primary) text-[0.625rem] font-bold text-white">
          {activeFilters}
        </span>
      {/if}
    </Button>
  </div>

  <!-- Desktop filter row; the same controls live in the mobile sheet below. -->
  <div class="hidden flex-wrap items-center gap-2 md:flex">
    {@render categoryChips()}
    {@render mutualToggle()}
  </div>
</div>

{#snippet categoryChips()}
  <button
    type="button"
    onclick={() => (category = 'all')}
    aria-pressed={category === 'all'}
    class="rounded-[var(--radius-chip)] border-[1.2px] px-3 py-1.5 text-[0.75rem] font-bold transition-colors {category ===
    'all'
      ? 'border-(--color-primary) bg-(--color-primary) text-white'
      : 'border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
  >
    All
  </button>
  {#each SKILL_CATEGORIES as c (c)}
    <button
      type="button"
      onclick={() => (category = c)}
      aria-pressed={category === c}
      class="rounded-[var(--radius-chip)] border-[1.2px] px-3 py-1.5 text-[0.75rem] font-bold transition-colors {category ===
      c
        ? 'border-(--color-primary) bg-(--color-primary) text-white'
        : 'border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
    >
      {CATEGORY_LABELS[c]}
    </button>
  {/each}
{/snippet}

{#snippet mutualToggle()}
  <label
    class="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-chip)] border-[1.2px] border-(--color-line) bg-(--color-card) px-3 py-1.5 text-[0.75rem] font-bold text-(--color-ink-secondary) has-checked:border-(--color-emerald) has-checked:text-(--color-emerald)"
  >
    <input type="checkbox" bind:checked={mutualOnly} class="size-3.5 accent-(--color-emerald)" />
    Mutual only
  </label>
{/snippet}

<Sheet bind:open={filtersOpen} title="Filters" side="bottom">
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">{@render categoryChips()}</div>
    {@render mutualToggle()}
    <Button variant="outline" full onclick={reset}><X /> Clear filters</Button>
  </div>
</Sheet>

{#if visible.length}
  <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each visible as match (match.targetUserId)}
      <MatchCard {match} peer={getProfile(match.targetUserId)!} />
    {/each}
  </div>

  {#if filtered.length > PAGE_SIZE}
    <Pagination bind:page total={filtered.length} perPage={PAGE_SIZE} label="matches" class="mt-6" />
  {/if}
{:else}
  <Card class="mt-5" padded={false}>
    <EmptyState
      icon={Compass}
      title="No matches with those filters"
      body="Try a broader category, or turn off “mutual only” — most trades on a campus this size settle in Karma rather than by direct barter."
    >
      {#snippet action()}
        <Button variant="outline" onclick={reset}>Clear filters</Button>
      {/snippet}
    </EmptyState>
  </Card>
{/if}
