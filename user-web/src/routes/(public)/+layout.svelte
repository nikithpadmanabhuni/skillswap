<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  let { children } = $props();
</script>

<div class="flex min-h-dvh flex-col">
  <header class="flex items-center justify-between px-5 py-4 sm:px-8">
    <a
      href="/"
      class="inline-flex items-center gap-2 text-[0.875rem] font-bold text-(--color-ink-secondary) hover:text-(--color-ink)"
    >
      <ArrowLeft class="size-4" /> SkillSwap Campus
    </a>
    <ThemeSwitcher />
  </header>

  <main id="main" class="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
    <div class="w-full max-w-sm">
      {@render children()}
    </div>
  </main>
</div>
