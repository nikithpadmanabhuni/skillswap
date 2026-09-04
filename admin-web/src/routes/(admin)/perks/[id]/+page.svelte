<script lang="ts">
  import { page } from '$app/state';
  import { Button, Card } from '$shared/components/ui';
  import { perks } from '$shared/mock';
  import PerkForm from '$lib/components/PerkForm.svelte';

  const perk = $derived(perks.find((p) => p.id === page.params.id));
</script>

<svelte:head><title>{perk?.title ?? 'Perk'} · SkillSwap Admin</title></svelte:head>

{#if perk}
  <PerkForm {perk} />
{:else}
  <Card class="text-center">
    <p class="text-body-lg">No such perk.</p>
    <Button href="/perks" variant="outline" class="mt-4">Back to perks</Button>
  </Card>
{/if}
