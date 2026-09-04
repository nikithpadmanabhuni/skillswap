<script lang="ts">
  import { ArrowLeft, Save, Trash2 } from 'lucide-svelte';
  import { untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button, Card, Input, Select, Switch, Textarea, toasts } from '$shared/components/ui';
  import { KarmaBadge, SectionHeader } from '$shared/components/domain';
  import type { CampusPerk } from '$shared/types';

  // Shared by /perks/new and /perks/[id] — identical fields, different verb.
  let { perk = undefined }: { perk?: CampusPerk } = $props();

  /*
   * The fields seed from `perk` ONCE, on purpose: after that they are the
   * operator's edits, and re-seeding from the prop would silently discard
   * whatever they had typed. untrack() states that intent rather than leaving
   * it to look like a missed reactive dependency. Each route mounts this fresh,
   * so a different perk always gets a fresh form.
   */
  const seed = untrack(() => perk);

  let title = $state(seed?.title ?? '');
  let vendor = $state(seed?.vendor ?? '');
  let category = $state(seed?.category ?? 'Food & Drink');
  let description = $state(seed?.description ?? '');
  let cost = $state(String(seed?.karmaCost ?? 50));
  let icon = $state(seed?.icon ?? 'coffee');
  let themeColor = $state<CampusPerk['themeColor']>(seed?.themeColor ?? 'karma');
  let active = $state(seed?.active ?? true);
  let error = $state('');

  const isNew = $derived(!perk);

  function save(e: SubmitEvent) {
    e.preventDefault();
    const n = Number(cost);
    if (!title.trim()) return (error = 'Give the perk a title.');
    if (!vendor.trim()) return (error = 'Name the vendor who will honour it.');
    if (!Number.isFinite(n) || n <= 0) return (error = 'Cost must be a positive number of Karma.');
    error = '';
    // TODO: convert to a form action (POST /perks or /perks/[id]).
    toasts.success(isNew ? 'Perk created.' : 'Perk updated.');
    goto('/perks');
  }
</script>

<a href="/perks" class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)">
  <ArrowLeft class="size-4" /> Perks
</a>

<div class="max-w-2xl">
  <SectionHeader
    title={isNew ? 'New perk' : `Edit ${perk?.title}`}
  level={1}
    subtitle="Students redeem this with Karma. A vendor has to be able to honour the code."
  />

  <form onsubmit={save} class="mt-3 flex flex-col gap-4">
    <Card class="flex flex-col gap-4">
      <Input label="Title" bind:value={title} placeholder="Free filter coffee" />
      <Textarea
        label="Description"
        bind:value={description}
        rows={2}
        hint="Say exactly what the student gets, and any limits."
      />
      <div class="grid gap-4 sm:grid-cols-2">
        <Input label="Vendor" bind:value={vendor} placeholder="The Grind (SU)" />
        <Select
          label="Category"
          options={[
            { value: 'Food & Drink', label: 'Food & Drink' },
            { value: 'Study', label: 'Study' },
            { value: 'Fitness', label: 'Fitness' },
            { value: 'Social', label: 'Social' }
          ]}
          bind:value={category}
        />
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <Input label="Karma cost" type="number" min="1" bind:value={cost} />
        <Select
          label="Icon"
          options={[
            { value: 'coffee', label: 'Coffee' },
            { value: 'printer', label: 'Printer' },
            { value: 'book-open', label: 'Book' },
            { value: 'dumbbell', label: 'Dumbbell' },
            { value: 'utensils', label: 'Utensils' },
            { value: 'users', label: 'Users' }
          ]}
          bind:value={icon}
        />
        <Select
          label="Accent"
          options={[
            { value: 'karma', label: 'Karma amber' },
            { value: 'brand', label: 'Indigo' },
            { value: 'emerald', label: 'Emerald' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'violet', label: 'Violet' },
            { value: 'danger', label: 'Rose' }
          ]}
          bind:value={themeColor}
        />
      </div>

      <Switch
        bind:checked={active}
        label="Active"
        description="Inactive perks stay in the ledger history but disappear from the student catalogue."
      />

      <p class="flex flex-wrap items-center gap-2 rounded-[var(--radius-input)] bg-(--color-elevated)/60 p-3.5 text-body-md text-(--color-ink-secondary)">
        Each redemption permanently removes
        <KarmaBadge amount={Number(cost) || 0} size="sm" glow={false} />
        from circulation.
      </p>

      {#if error}
        <p class="text-[0.8125rem] font-semibold text-(--color-danger)" role="alert">{error}</p>
      {/if}
    </Card>

    <div class="flex justify-between gap-2">
      {#if !isNew}
        <Button
          variant="ghost"
          class="text-(--color-danger)"
          onclick={() => {
            toasts.success('Perk archived.');
            goto('/perks');
          }}
        >
          <Trash2 /> Archive
        </Button>
      {:else}
        <span></span>
      {/if}
      <div class="flex gap-2">
        <Button variant="outline" href="/perks">Cancel</Button>
        <Button type="submit"><Save /> {isNew ? 'Create perk' : 'Save changes'}</Button>
      </div>
    </div>
  </form>
</div>
