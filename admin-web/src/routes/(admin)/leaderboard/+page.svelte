<script lang="ts">
  import { Tabs } from '$shared/components/ui';
  import { LeaderboardRow, SectionHeader } from '$shared/components/domain';
  import { topKarma, topTeachers } from '$shared/mock';

  let board = $state<'hours' | 'karma'>('hours');
  const rows = $derived(board === 'hours' ? topTeachers : topKarma);
</script>

<svelte:head><title>Leaderboard · SkillSwap Admin</title></svelte:head>

<SectionHeader
  title="Leaderboard" level={1}
  subtitle="The same two rankings students see. Suspended accounts are excluded."
/>

<Tabs
  tabs={[
    { value: 'hours', label: 'Hours taught' },
    { value: 'karma', label: 'Karma balance' }
  ]}
  bind:value={board}
  class="mt-3"
/>

<div id="panel-{board}" role="tabpanel" aria-labelledby="tab-{board}" tabindex="-1">
  <ol class="mt-4 flex flex-col gap-2">
    {#each rows as user, i (user.id)}
      <LeaderboardRow {user} rank={i + 1} metric={board} profileHref={(id) => `/users/${id}`} />
    {/each}
  </ol>
</div>
