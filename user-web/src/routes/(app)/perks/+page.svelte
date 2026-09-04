<script lang="ts">
  import { Gift } from 'lucide-svelte';
  import { Card } from '$shared/components/ui';
  import { EmptyState, KarmaBadge, PerkCard, SectionHeader } from '$shared/components/domain';
  import { currentUser, perks } from '$shared/mock';

  // Sorted by cost, cheapest first (spec 3.1, "six seeded perks, sorted by cost").
  const catalogue = [...perks].filter((p) => p.active).sort((a, b) => a.karmaCost - b.karmaCost);
  const affordable = catalogue.filter((p) => p.karmaCost <= currentUser.karmaBalance).length;
</script>

<svelte:head><title>Campus perks · SkillSwap Campus</title></svelte:head>

<SectionHeader
  title="Campus perks" level={1}
  subtitle="Spend Karma with campus services. {affordable} of {catalogue.length} are within reach."
>
  {#snippet action()}
    <KarmaBadge amount={currentUser.karmaBalance} />
  {/snippet}
</SectionHeader>

{#if catalogue.length}
  <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each catalogue as perk (perk.id)}
      <PerkCard {perk} balance={currentUser.karmaBalance} />
    {/each}
  </div>
{:else}
  <Card class="mt-4" padded={false}>
    <EmptyState
      icon={Gift}
      title="No perks available"
      body="The catalogue is empty. Campus services add perks through the admin panel."
    />
  </Card>
{/if}
