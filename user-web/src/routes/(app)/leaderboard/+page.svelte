<script lang="ts">
  import { Tabs } from '$shared/components/ui';
  import { LeaderboardRow, SectionHeader } from '$shared/components/domain';
  import { CURRENT_USER_ID, topKarma, topTeachers } from '$shared/mock';

  // Two rankings, per spec 2.4: by hours taught and by Karma balance.
  let board = $state<'hours' | 'karma'>('hours');
  const rows = $derived(board === 'hours' ? topTeachers : topKarma);
  const myRank = $derived(rows.findIndex((u) => u.id === CURRENT_USER_ID) + 1);
</script>

<svelte:head><title>Leaderboard · SkillSwap Campus</title></svelte:head>

<SectionHeader
  title="Leaderboard" level={1}
  subtitle={myRank ? `You are ranked ${myRank} of ${rows.length}.` : 'Ranked across the campus.'}
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
  <p class="mt-3 text-[0.8125rem] text-(--color-ink-muted)">
    {#if board === 'hours'}
      Hours are derived from settled sessions, not self-reported.
    {:else}
      A closed economy caps how far balances can spread: every Karma someone holds is one another
      spent, so the top of this board is bounded by how much the rest of the campus has invested in
      learning.
    {/if}
  </p>

  <ol class="mt-3 flex flex-col gap-2">
    {#each rows as user, i (user.id)}
      <LeaderboardRow {user} rank={i + 1} metric={board} isMe={user.id === CURRENT_USER_ID} />
    {/each}
  </ol>
</div>
