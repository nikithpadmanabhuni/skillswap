<script lang="ts">
  import { ArrowLeft, Check, Circle, Clock, FileText } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Button, Card, toasts } from '$shared/components/ui';
  import { KarmaBadge, MeshTriangle, SectionHeader } from '$shared/components/domain';
  import { KARMA, getProfile, meshes } from '$shared/mock';
  import { formatDate } from '$shared/utils/format';

  const mesh = $derived(meshes.find((m) => m.id === page.params.meshId));
  const a = $derived(mesh ? getProfile(mesh.userAId) : undefined);
  const b = $derived(mesh ? getProfile(mesh.userBId) : undefined);
  const c = $derived(mesh ? getProfile(mesh.userCId) : undefined);

  // Local progress echo. TODO: form action — three-party completion settles
  // Karma across the whole loop atomically (spec task 5.3).
  let extraDone = $state(0);
  const done = $derived(
    Math.min(
      (mesh?.milestones.filter((m) => m.isCompleted).length ?? 0) + extraDone,
      mesh?.milestones.length ?? 0
    )
  );
  const total = $derived(mesh?.milestones.length ?? 0);
  const complete = $derived(total > 0 && done === total);
  const totalMinutes = $derived(
    mesh?.milestones.reduce((s, m) => s + m.durationMinutes, 0) ?? 0
  );
</script>

<svelte:head><title>Smart Lab · SkillSwap Campus</title></svelte:head>

<a
  href="/mesh"
  class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
>
  <ArrowLeft class="size-4" /> Mesh
</a>

{#if !mesh || !a || !b || !c}
  <Card class="text-center">
    <p class="text-body-lg">That mesh does not exist.</p>
    <Button href="/mesh" variant="outline" class="mt-4">Back to mesh</Button>
  </Card>
{:else}
  <div class="grid gap-5 lg:grid-cols-[22rem_1fr]">
    <div class="flex flex-col gap-4">
      <Card>
        <MeshTriangle {mesh} {a} {b} {c} />
      </Card>

      <Card class="flex flex-col gap-3">
        <p class="text-[0.6875rem] font-bold tracking-wide text-(--color-ink-muted) uppercase">
          Loop details
        </p>
        <dl class="flex flex-col gap-2 text-[0.8125rem]">
          <div class="flex justify-between gap-3">
            <dt class="text-(--color-ink-muted)">Synergy</dt>
            <dd class="font-bold text-(--color-ink)">{mesh.synergyScore}%</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-(--color-ink-muted)">Created</dt>
            <dd class="font-bold text-(--color-ink)">{formatDate(mesh.createdAt)}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-(--color-ink-muted)">Total time</dt>
            <dd class="font-bold text-(--color-ink)">
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-(--color-ink-muted)">Karma each</dt>
            <dd><KarmaBadge amount={KARMA.MESH_TEACH} size="sm" glow={false} signed /></dd>
          </div>
        </dl>
        <p class="border-t-[1.2px] border-(--color-line) pt-3 text-[0.75rem] leading-snug text-(--color-ink-muted)">
          Each of you teaches one session and learns one, so the Karma cancels out across the loop —
          the same as a direct mutual swap, just three-sided.
        </p>
      </Card>
    </div>

    <div class="flex flex-col gap-4">
      <SectionHeader
        title="Smart Lab"
        subtitle="Four phases, {done} of {total} complete."
      />

      <!-- Progress bar, labelled for assistive tech rather than colour-only. -->
      <div
        class="h-2 overflow-hidden rounded-full bg-(--color-elevated)"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin="0"
        aria-valuemax={total}
        aria-label="Mesh progress"
      >
        <div
          class="h-full rounded-full bg-gradient-mesh transition-[width] duration-500"
          style="width:{total ? (done / total) * 100 : 0}%"
        ></div>
      </div>

      <ol class="flex flex-col gap-3">
        {#each mesh.milestones as milestone, i (milestone.id)}
          {@const isDone = i < done}
          {@const isNext = i === done}
          <li>
            <Card
              class="flex gap-3 {isNext ? 'border-(--color-primary)' : ''}"
            >
              <span
                class="grid size-8 shrink-0 place-items-center rounded-full {isDone
                  ? 'bg-(--color-emerald) text-white'
                  : isNext
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-elevated) text-(--color-ink-muted)'}"
              >
                {#if isDone}<Check class="size-4" />{:else}<Circle class="size-3.5" />{/if}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-title-sm text-(--color-ink)">
                    {i + 1}. {milestone.title}
                  </h3>
                  <span class="inline-flex items-center gap-1 text-[0.6875rem] text-(--color-ink-muted)">
                    <Clock class="size-3" />{milestone.durationMinutes} min
                  </span>
                </div>
                <p class="mt-1 text-body-md leading-[1.45] text-(--color-ink-secondary)">
                  {milestone.description}
                </p>
                {#if isNext}
                  <Button
                    size="sm"
                    class="mt-3"
                    onclick={() => {
                      extraDone += 1;
                      toasts.success(`${milestone.title} marked complete.`);
                    }}
                  >
                    Mark complete
                  </Button>
                {/if}
              </div>
            </Card>
          </li>
        {/each}
      </ol>

      {#if complete}
        <Card class="flex flex-col items-center gap-3 text-center">
          <span class="grid size-12 place-items-center rounded-full bg-(--color-emerald)/15 text-(--color-emerald)">
            <FileText class="size-6" />
          </span>
          <div>
            <h3 class="text-title-md text-(--color-ink)">Loop complete</h3>
            <!--
              Reference id, not a signature. The Flutter app rendered
              'SHA256-<32-bit hashCode>-VERIFIED', which was neither a SHA-256
              nor verified (spec 3.2). With no server there is nothing to sign,
              so the copy says what this actually is.
            -->
            <p class="mt-1 text-body-md text-(--color-ink-muted)">
              Recorded against all three accounts. Reference
              <span class="font-mono font-bold text-(--color-ink)">{mesh.referenceId}</span>.
            </p>
            <p class="mt-2 text-[0.75rem] text-(--color-ink-muted)">
              This is a record locator, not a cryptographic credential — a signed certificate needs a
              server to sign it.
            </p>
          </div>
        </Card>
      {/if}
    </div>
  </div>
{/if}
