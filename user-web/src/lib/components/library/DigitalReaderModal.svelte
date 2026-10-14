<script lang="ts">
  import {
    BookOpen,
    Minus,
    Plus,
    X,
    Sun,
    Moon,
    Coffee,
    Bookmark,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  import type { Book } from '$shared/types';
  import { Dialog, Button } from '$shared/components/ui';

  let {
    open = $bindable(false),
    book
  }: {
    open: boolean;
    book: Book | null;
  } = $props();

  let theme = $state<'sepia' | 'light' | 'dark'>('sepia');
  let fontSize = $state<number>(16);

  const themeClasses = {
    sepia: 'bg-[#FDF6E3] text-[#2D2013] border-[#EEE8D5]',
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-[#0F172A] text-slate-100 border-slate-800'
  };

  const themeControlClasses = {
    sepia: 'bg-[#F4ECE1] border-[#E2D6C3] text-[#2D2013]',
    light: 'bg-slate-100 border-slate-200 text-slate-800',
    dark: 'bg-slate-800 border-slate-700 text-slate-200'
  };
</script>

<Dialog bind:open title={book?.title ?? 'Digital Reader'} size="lg">
  {#if book}
    <div class="flex flex-col gap-3">
      <!-- Reader toolbar -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2 transition-colors {themeControlClasses[theme]}"
      >
        <!-- Theme switcher -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            onclick={() => (theme = 'sepia')}
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition {theme === 'sepia'
              ? 'bg-[#EADDC9] shadow-xs'
              : 'hover:bg-black/5'}"
          >
            <Coffee class="size-3.5 text-amber-800" />
            <span>Sepia</span>
          </button>
          <button
            type="button"
            onclick={() => (theme = 'light')}
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition {theme === 'light'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:bg-black/5'}"
          >
            <Sun class="size-3.5 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onclick={() => (theme = 'dark')}
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition {theme === 'dark'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'hover:bg-black/5'}"
          >
            <Moon class="size-3.5 text-indigo-400" />
            <span>Dark</span>
          </button>
        </div>

        <!-- Font size controls -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold">Font</span>
          <button
            type="button"
            onclick={() => (fontSize = Math.max(14, fontSize - 1))}
            class="grid size-7 place-items-center rounded-md border border-black/10 hover:bg-black/5"
            aria-label="Decrease font size"
          >
            <Minus class="size-3.5" />
          </button>
          <span class="font-mono text-xs">{fontSize}px</span>
          <button
            type="button"
            onclick={() => (fontSize = Math.min(24, fontSize + 1))}
            class="grid size-7 place-items-center rounded-md border border-black/10 hover:bg-black/5"
            aria-label="Increase font size"
          >
            <Plus class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Book Reader Content Area -->
      <div
        class="max-h-[60vh] overflow-y-auto rounded-2xl border p-6 font-serif leading-relaxed transition-colors shadow-inner {themeClasses[theme]}"
        style="font-size: {fontSize}px;"
      >
        <div class="mb-4 border-b border-current/10 pb-3">
          <p class="font-sans text-xs uppercase tracking-widest opacity-60">
            {book.genre} Department • Northgate E-Library
          </p>
          <h2 class="font-sans text-lg font-extrabold">{book.title}</h2>
          <p class="font-sans text-xs opacity-75">By {book.author}</p>
        </div>

        <div class="space-y-4 whitespace-pre-line">
          {book.sampleChapter}
        </div>

        <div class="mt-8 border-t border-current/10 pt-4 text-center font-sans text-xs opacity-60">
          — End of Digital Reading Sample • Full Textbook Available in Central Library Stacks —
        </div>
      </div>
    </div>
  {/if}

  {#snippet footer()}
    <div class="flex w-full items-center justify-between">
      <span class="text-xs text-(--color-ink-muted)">
        {book?.pages} Pages • ISBN: {book?.isbn}
      </span>
      <Button variant="outline" onclick={() => (open = false)}>Close Reader</Button>
    </div>
  {/snippet}
</Dialog>
