<script lang="ts">
  import { ArrowRight, Check, Plus, Sparkles, Trash2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Input, Select, Textarea } from '$shared/components/ui';
  import { KarmaBadge, SkillChip } from '$shared/components/domain';
  import { CATEGORY_LABELS, LEVEL_LABELS, SKILL_CATEGORIES, SKILL_LEVELS, type Skill, type SkillCategory, type SkillLevel } from '$shared/types';
  import { CAMPUS, KARMA } from '$shared/mock';
  import { session } from '$lib/session.svelte';

  // Three steps: who you are, what you teach, what you want. Splitting it keeps
  // the first-run form from looking like a tax return.
  let step = $state(1);
  const STEPS = ['About you', 'What you teach', 'What you want'];

  let name = $state('');
  let campus = $state(CAMPUS);
  let major = $state('');
  let bio = $state('');

  let offered = $state<Skill[]>([]);
  let wanted = $state<Skill[]>([]);

  let title = $state('');
  let category = $state<SkillCategory>('tech');
  let level = $state<SkillLevel>('intermediate');
  let error = $state('');

  function add(kind: 'offer' | 'want') {
    const t = title.trim();
    if (!t) return (error = 'Give the skill a name.');
    const list = kind === 'offer' ? offered : wanted;
    if (list.some((s) => s.title.toLowerCase() === t.toLowerCase()))
      return (error = 'Already on this list.');

    const skill: Skill = {
      id: `onb-${kind}-${list.length}`,
      title: t,
      category,
      level,
      description: '',
      isOffering: kind === 'offer'
    };
    if (kind === 'offer') offered = [...offered, skill];
    else wanted = [...wanted, skill];
    title = '';
    error = '';
  }

  const canContinue = $derived(
    step === 1 ? name.trim().length > 0 && major.trim().length > 0 : true
  );

  function finish() {
    session.needsOnboarding = false;
    goto('/explore');
  }
</script>

<svelte:head><title>Set up your profile · SkillSwap Campus</title></svelte:head>

<main id="main" class="mx-auto max-w-xl px-5 py-10 sm:px-8">
  <div class="mb-6">
    <ol class="flex items-center gap-2" aria-label="Progress">
      {#each STEPS as label, i (label)}
        {@const n = i + 1}
        <li class="flex flex-1 items-center gap-2">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold {n <
            step
              ? 'bg-(--color-emerald) text-white'
              : n === step
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-elevated) text-(--color-ink-muted)'}"
            aria-current={n === step ? 'step' : undefined}
          >
            {#if n < step}<Check class="size-3.5" />{:else}{n}{/if}
          </span>
          <span
            class="hidden text-[0.75rem] font-bold sm:inline {n === step
              ? 'text-(--color-ink)'
              : 'text-(--color-ink-muted)'}"
          >
            {label}
          </span>
          {#if n < STEPS.length}<span class="h-px flex-1 bg-(--color-line)"></span>{/if}
        </li>
      {/each}
    </ol>
  </div>

  <Card class="flex flex-col gap-5">
    {#if step === 1}
      <div>
        <h1 class="text-title-lg text-(--color-ink)">Tell us who you are</h1>
        <p class="mt-1 flex flex-wrap items-center gap-1.5 text-body-md text-(--color-ink-muted)">
          Your account already has <KarmaBadge amount={KARMA.JOINING_GRANT} size="sm" glow={false} />
          to spend.
        </p>
      </div>
      <Input label="Display name" bind:value={name} placeholder="How you want to appear" />
      <Input label="Campus" bind:value={campus} />
      <Input label="Course or major" bind:value={major} placeholder="Computer Science" />
      <Textarea
        label="Short bio"
        bind:value={bio}
        rows={3}
        hint="One or two sentences. What you know, what you are after."
      />
    {:else if step === 2}
      <div>
        <h1 class="text-title-lg text-(--color-ink)">What can you teach?</h1>
        <p class="mt-1 text-body-md text-(--color-ink-muted)">
          Teaching earns Karma. You do not need to be an expert — beginners often explain things
          best.
        </p>
      </div>
      {@render skillForm('offer', offered)}
    {:else}
      <div>
        <h1 class="text-title-lg text-(--color-ink)">What do you want to learn?</h1>
        <p class="mt-1 text-body-md text-(--color-ink-muted)">
          The more you list, the more matches — and the more likely a three-way loop closes.
        </p>
      </div>
      {@render skillForm('want', wanted)}
    {/if}

    <div class="flex justify-between gap-2 border-t-[1.2px] border-(--color-line) pt-4">
      {#if step > 1}
        <Button variant="outline" onclick={() => (step -= 1)}>Back</Button>
      {:else}
        <span></span>
      {/if}

      {#if step < 3}
        <Button disabled={!canContinue} onclick={() => (step += 1)}>Continue <ArrowRight /></Button>
      {:else}
        <Button onclick={finish}><Sparkles /> Start swapping</Button>
      {/if}
    </div>
  </Card>

  {#if step === 3}
    <p class="mt-4 text-center text-[0.8125rem] text-(--color-ink-muted)">
      You can change any of this later from your profile.
    </p>
  {/if}
</main>

{#snippet skillForm(kind: 'offer' | 'want', list: Skill[])}
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <Input label="Skill" bind:value={title} error={error || undefined} placeholder="Acoustic Guitar" />
      <div class="flex items-end">
        <Button variant="outline" onclick={() => add(kind)} class="h-11"><Plus /> Add</Button>
      </div>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Select
        label="Category"
        options={SKILL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        bind:value={category}
      />
      <Select
        label="Level"
        options={SKILL_LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
        bind:value={level}
      />
    </div>

    <ul class="flex min-h-12 flex-wrap gap-2">
      {#each list as skill (skill.id)}
        <li class="inline-flex items-center gap-1">
          <SkillChip {skill} />
          <button
            type="button"
            aria-label="Remove {skill.title}"
            onclick={() => {
              if (kind === 'offer') offered = offered.filter((s) => s.id !== skill.id);
              else wanted = wanted.filter((s) => s.id !== skill.id);
            }}
            class="grid size-7 place-items-center rounded-full text-(--color-ink-muted) hover:bg-(--color-danger)/12 hover:text-(--color-danger)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </li>
      {:else}
        <li class="self-center text-body-md text-(--color-ink-muted)">Nothing added yet.</li>
      {/each}
    </ul>
  </div>
{/snippet}
