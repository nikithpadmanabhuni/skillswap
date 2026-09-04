<script lang="ts">
  import { ArrowRight, Info, Triangle } from 'lucide-svelte';
  import { Button, Card } from '$shared/components/ui';
  import { EmptyState, MeshTriangle, SectionHeader } from '$shared/components/domain';
  import { CURRENT_USER_ID, getProfile, meshesFor } from '$shared/mock';

  const loops = meshesFor(CURRENT_USER_ID);
  const active = loops.filter((m) => m.status === 'active');
</script>

<svelte:head><title>3-way mesh · SkillSwap Campus</title></svelte:head>

<SectionHeader
  title="3-way skill mesh"
  subtitle="Trades that a 1:1 marketplace structurally cannot see."
/>

<Card class="mt-3 flex items-start gap-3">
  <Info class="mt-0.5 size-[18px] shrink-0 text-(--color-primary)" />
  <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">
    Direct barter needs a double coincidence of wants — you want what they offer
    <em>and</em> they want what you offer. A triangle relaxes that: you teach B, B teaches C, C
    teaches you. The loop closes with no currency at all.
  </p>
</Card>

{#if loops.length}
  <div class="mt-5 flex flex-col gap-5">
    {#each loops as mesh (mesh.id)}
      {@const a = getProfile(mesh.userAId)}
      {@const b = getProfile(mesh.userBId)}
      {@const c = getProfile(mesh.userCId)}
      {#if a && b && c}
        <Card class="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <div class="mx-auto w-full max-w-sm">
            <MeshTriangle {mesh} {a} {b} {c} />
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border-[1.2px] border-(--color-violet)/40 bg-(--color-violet)/12 px-3 py-1.5 text-[0.8125rem] font-extrabold text-(--color-violet)"
              >
                <Triangle class="size-3.5" />{mesh.synergyScore}% synergy
              </span>
              <span
                class="rounded-[var(--radius-chip)] border-[1.2px] px-2.5 py-1 text-[0.6875rem] font-bold uppercase {mesh.status ===
                'completed'
                  ? 'border-(--color-emerald)/40 bg-(--color-emerald)/12 text-(--color-emerald)'
                  : 'border-(--color-line) bg-(--color-elevated) text-(--color-ink-secondary)'}"
              >
                {mesh.status}
              </span>
            </div>

            <p class="text-body-lg leading-relaxed text-(--color-ink-secondary)">
              {mesh.reasoning}
            </p>

            <div class="mt-1">
              <Button href="/mesh/{mesh.id}">
                {mesh.status === 'completed' ? 'View Smart Lab' : 'Open Smart Lab'}
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Card>
      {/if}
    {/each}
  </div>

  {#if !active.length}
    <p class="mt-4 text-center text-[0.8125rem] text-(--color-ink-muted)">
      No active loops. Add more wanted skills to your profile and more triangles become findable.
    </p>
  {/if}
{:else}
  <Card class="mt-5" padded={false}>
    <EmptyState
      icon={Triangle}
      title="No loops found yet"
      body="A mesh needs three people whose wants chain together. Listing more skills — offered and wanted — makes one far more likely."
    >
      {#snippet action()}<Button href="/profile/edit">Edit your skills</Button>{/snippet}
    </EmptyState>
  </Card>
{/if}
