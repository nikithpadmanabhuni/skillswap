<script lang="ts">
  import { Monitor, Moon, Sun } from 'lucide-svelte';
  import { THEMES, THEME_LABELS, theme, type Theme } from '$shared/theme.svelte';

  // Three themes, matching the Flutter app: Light / Dark / Night (true OLED black).
  const ICONS: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, night: Monitor };
</script>

<div
  class="inline-flex items-center gap-0.5 rounded-full border-[1.2px] border-(--color-line) bg-(--color-card) p-1"
  role="group"
  aria-label="Colour theme"
>
  {#each THEMES as t (t)}
    {@const Icon = ICONS[t]}
    <button
      type="button"
      onclick={() => theme.set(t)}
      aria-pressed={theme.current === t}
      title={THEME_LABELS[t]}
      class="grid size-8 place-items-center rounded-full transition-colors {theme.current === t
        ? 'bg-(--color-primary) text-white'
        : 'text-(--color-ink-muted) hover:bg-(--color-elevated)'}"
    >
      <Icon class="size-4" />
      <span class="sr-only">{THEME_LABELS[t]} theme</span>
    </button>
  {/each}
</div>
