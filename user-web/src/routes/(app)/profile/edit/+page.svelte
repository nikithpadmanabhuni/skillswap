<script lang="ts">
  import { ArrowLeft, Plus, Save, Trash2, Upload } from 'lucide-svelte';
  import {
    Avatar,
    Button,
    Card,
    Dialog,
    Input,
    Select,
    Textarea,
    toasts
  } from '$shared/components/ui';
  import { SectionHeader, SkillChip } from '$shared/components/domain';
  import {
    CATEGORY_LABELS,
    LEVEL_LABELS,
    SKILL_CATEGORIES,
    SKILL_LEVELS,
    type Skill,
    type SkillCategory,
    type SkillLevel
  } from '$shared/types';
  import { currentUser } from '$shared/mock';

  let name = $state(currentUser.name);
  let campus = $state(currentUser.campus);
  let major = $state(currentUser.major);
  let phone = $state(currentUser.phoneNumber);
  let bio = $state(currentUser.bio);
  let avatarPreview = $state('');

  let offered = $state<Skill[]>([...currentUser.skillsOffered]);
  let wanted = $state<Skill[]>([...currentUser.skillsWanted]);
  let availability = $state<string[]>([...currentUser.availability]);

  const SLOTS = [
    'Mon morning', 'Mon lunch', 'Mon evening',
    'Tue morning', 'Tue lunch', 'Tue evening',
    'Wed morning', 'Wed lunch', 'Wed evening',
    'Thu morning', 'Thu lunch', 'Thu evening',
    'Fri morning', 'Fri lunch', 'Fri evening',
    'Sat morning', 'Sat afternoon', 'Sun afternoon', 'Sun evening'
  ];

  let skillDialog = $state(false);
  let skillMode = $state<'offer' | 'want'>('offer');
  let sTitle = $state('');
  let sCategory = $state<SkillCategory>('tech');
  let sLevel = $state<SkillLevel>('beginner');
  let sDescription = $state('');
  let sError = $state('');

  function openSkillDialog(mode: 'offer' | 'want') {
    skillMode = mode;
    sTitle = '';
    sCategory = 'tech';
    sLevel = 'beginner';
    sDescription = '';
    sError = '';
    skillDialog = true;
  }

  /**
   * Deduplication is by lowercased, trimmed title (spec 3.1, "normalised by
   * lowercased title"). Checked against the list being added to, so the same
   * skill can legitimately appear once as offered and once as wanted.
   */
  function addSkill() {
    const title = sTitle.trim();
    if (!title) return (sError = 'Give the skill a name.');

    const list = skillMode === 'offer' ? offered : wanted;
    if (list.some((s) => s.title.trim().toLowerCase() === title.toLowerCase())) {
      return (sError = 'That skill is already on this list.');
    }

    const skill: Skill = {
      id: `local-${skillMode}-${list.length}-${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      category: sCategory,
      level: sLevel,
      description: sDescription.trim(),
      isOffering: skillMode === 'offer'
    };

    if (skillMode === 'offer') offered = [...offered, skill];
    else wanted = [...wanted, skill];

    skillDialog = false;
  }

  const removeOffered = (id: string) => (offered = offered.filter((s) => s.id !== id));
  const removeWanted = (id: string) => (wanted = wanted.filter((s) => s.id !== id));

  const toggleSlot = (slot: string) =>
    (availability = availability.includes(slot)
      ? availability.filter((s) => s !== slot)
      : [...availability, slot]);

  // TODO: convert to a form action. Note what is NOT here: karmaBalance, rating,
  // reviewCount and hours. Those are server-computed and client-read-only (spec
  // 2.4) — in the Flutter app the whole User document was written back, which is
  // what made reputation forgeable (audit P0-3).
  function save(e: SubmitEvent) {
    e.preventDefault();
    toasts.success('Profile saved.');
  }

  function pickAvatar(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Object URL rather than base64: the Flutter app stored base64 in the user
    // document, which spec 4.3 replaces with Firebase Storage.
    avatarPreview = URL.createObjectURL(file);
  }
</script>

<svelte:head><title>Edit profile · SkillSwap Campus</title></svelte:head>

<a
  href="/profile"
  class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
>
  <ArrowLeft class="size-4" /> Profile
</a>

<SectionHeader
  title="Edit profile"
  level={1}
  subtitle="Your reputation is not editable here — rating, hours and Karma are computed from your sessions."
/>

<form onsubmit={save} class="mt-3 flex flex-col gap-5">
  <Card class="flex flex-col gap-5">
    <SectionHeader title="Details" />

    <div class="flex items-center gap-4">
      <Avatar name={currentUser.name} src={avatarPreview} size={72} />
      <div>
        <label
          class="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-button)] border-[1.4px] border-(--color-line) px-4 py-2.5 text-[0.875rem] font-bold text-(--color-ink) hover:bg-(--color-elevated)"
        >
          <Upload class="size-4" /> Change photo
          <input type="file" accept="image/*" class="sr-only" onchange={pickAvatar} />
        </label>
        <p class="mt-1.5 text-[0.75rem] text-(--color-ink-muted)">JPG or PNG, up to 2 MB.</p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Input label="Display name" bind:value={name} />
      <Input label="Campus" bind:value={campus} />
      <Input label="Major" bind:value={major} />
      <Input label="Phone" type="tel" bind:value={phone} hint="Never shown to other students." />
    </div>

    <Textarea
      label="Bio"
      bind:value={bio}
      rows={3}
      hint="What you can teach, and what you are hoping to pick up."
    />
  </Card>

  <Card class="flex flex-col gap-4">
    <SectionHeader title="Skills you teach" subtitle="{offered.length} listed.">
      {#snippet action()}
        <Button size="sm" variant="outline" onclick={() => openSkillDialog('offer')}>
          <Plus /> Add
        </Button>
      {/snippet}
    </SectionHeader>

    <ul class="flex flex-wrap gap-2">
      {#each offered as skill (skill.id)}
        <li class="inline-flex items-center gap-1">
          <SkillChip {skill} />
          <button
            type="button"
            onclick={() => removeOffered(skill.id)}
            aria-label="Remove {skill.title}"
            class="grid size-7 place-items-center rounded-full text-(--color-ink-muted) hover:bg-(--color-danger)/12 hover:text-(--color-danger)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </li>
      {:else}
        <li class="text-body-md text-(--color-ink-muted)">Nothing yet — add what you can teach.</li>
      {/each}
    </ul>
  </Card>

  <Card class="flex flex-col gap-4">
    <SectionHeader title="Skills you want" subtitle="{wanted.length} listed.">
      {#snippet action()}
        <Button size="sm" variant="outline" onclick={() => openSkillDialog('want')}>
          <Plus /> Add
        </Button>
      {/snippet}
    </SectionHeader>

    <ul class="flex flex-wrap gap-2">
      {#each wanted as skill (skill.id)}
        <li class="inline-flex items-center gap-1">
          <SkillChip {skill} />
          <button
            type="button"
            onclick={() => removeWanted(skill.id)}
            aria-label="Remove {skill.title}"
            class="grid size-7 place-items-center rounded-full text-(--color-ink-muted) hover:bg-(--color-danger)/12 hover:text-(--color-danger)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </li>
      {:else}
        <li class="text-body-md text-(--color-ink-muted)">Nothing yet — add what you want to learn.</li>
      {/each}
    </ul>
  </Card>

  <Card class="flex flex-col gap-4">
    <SectionHeader title="Availability" subtitle="{availability.length} slots selected." />
    <div class="flex flex-wrap gap-2">
      {#each SLOTS as slot (slot)}
        <button
          type="button"
          onclick={() => toggleSlot(slot)}
          aria-pressed={availability.includes(slot)}
          class="rounded-[var(--radius-chip)] border-[1.2px] px-3 py-1.5 text-[0.75rem] font-bold transition-colors {availability.includes(
            slot
          )
            ? 'border-(--color-ocean) bg-(--color-ocean)/12 text-(--color-ocean)'
            : 'border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
        >
          {slot}
        </button>
      {/each}
    </div>
  </Card>

  <div class="flex justify-end gap-2">
    <Button variant="outline" href="/profile">Cancel</Button>
    <Button type="submit"><Save /> Save changes</Button>
  </div>
</form>

<Dialog
  bind:open={skillDialog}
  title={skillMode === 'offer' ? 'Add a skill you teach' : 'Add a skill you want'}
>
  <div class="flex flex-col gap-4">
    <Input label="Skill" bind:value={sTitle} error={sError || undefined} placeholder="Acoustic Guitar" />
    <div class="grid gap-4 sm:grid-cols-2">
      <Select
        label="Category"
        options={SKILL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        bind:value={sCategory}
      />
      <Select
        label={skillMode === 'offer' ? 'Your level' : 'Level you want'}
        options={SKILL_LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
        bind:value={sLevel}
      />
    </div>
    <Textarea label="Description" bind:value={sDescription} rows={2} />
  </div>
  {#snippet footer()}
    <Button variant="outline" onclick={() => (skillDialog = false)}>Cancel</Button>
    <Button onclick={addSkill}>Add skill</Button>
  {/snippet}
</Dialog>
