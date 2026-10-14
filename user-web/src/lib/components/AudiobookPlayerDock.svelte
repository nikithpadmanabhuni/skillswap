<script lang="ts">
  import {
    Headphones,
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    X,
    ChevronDown,
    ChevronUp,
    Volume2
  } from 'lucide-svelte';
  import { audiobook } from '../audiobook.svelte';

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  let book = $derived(audiobook.currentBook);
  let progressPct = $derived(
    audiobook.totalSeconds > 0 ? (audiobook.progressSeconds / audiobook.totalSeconds) * 100 : 0
  );
</script>

{#if book}
  <!-- Dock container positioned above bottom bar on mobile and bottom right on desktop -->
  <aside
    aria-label="Audiobook Player"
    class="fixed z-40 transition-all duration-300 {audiobook.isMinimized
      ? 'bottom-18 md:bottom-6 right-4 w-72'
      : 'bottom-18 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-105'}"
  >
    <div
      class="overflow-hidden rounded-2xl border-[1.2px] border-(--color-line) bg-(--color-card) shadow-2xl backdrop-blur-md"
    >
      <!-- Top gradient accent strip -->
      <div
        class="h-1.5 w-full bg-gradient-to-r"
        style="background: linear-gradient(90deg, {book.gradientColors[0]}, {book.gradientColors[1]});"
      >
        <div
          class="h-full bg-white/70 transition-all duration-200"
          style="width: {progressPct}%"
        ></div>
      </div>

      <div class="p-3.5">
        <div class="flex items-center gap-3">
          <!-- Thumbnail cover -->
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style="background: linear-gradient(135deg, {book.gradientColors[0]}, {book.gradientColors[1]});"
          >
            <Headphones class="size-5" />
          </div>

          <!-- Metadata -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style="background-color: {book.gradientColors[0]};"
              >
                Audiobook
              </span>
              <span class="truncate text-xs font-semibold text-(--color-ink-muted)">
                Chapter 1
              </span>
            </div>
            <p class="truncate text-sm font-bold text-(--color-ink)">
              {book.title}
            </p>
            <p class="truncate text-xs text-(--color-ink-secondary)">
              Narrated by {book.author}
            </p>
          </div>

          <!-- Quick Controls -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              onclick={() => audiobook.togglePlay()}
              class="grid size-9 place-items-center rounded-full bg-(--color-primary) text-white shadow-sm transition hover:scale-105 active:scale-95"
              aria-label={audiobook.isPlaying ? 'Pause' : 'Play'}
            >
              {#if audiobook.isPlaying}
                <Pause class="size-4.5" />
              {:else}
                <Play class="size-4.5 fill-current translate-x-0.5" />
              {/if}
            </button>

            <button
              type="button"
              onclick={() => (audiobook.isMinimized = !audiobook.isMinimized)}
              class="grid size-8 place-items-center rounded-lg text-(--color-ink-muted) transition hover:bg-(--color-elevated) hover:text-(--color-ink)"
              aria-label={audiobook.isMinimized ? 'Expand player' : 'Minimize player'}
            >
              {#if audiobook.isMinimized}
                <ChevronUp class="size-4" />
              {:else}
                <ChevronDown class="size-4" />
              {/if}
            </button>

            <button
              type="button"
              onclick={() => audiobook.close()}
              class="grid size-8 place-items-center rounded-lg text-(--color-ink-muted) transition hover:bg-(--color-elevated) hover:text-(--color-danger)"
              aria-label="Close audiobook player"
            >
              <X class="size-4" />
            </button>
          </div>
        </div>

        {#if !audiobook.isMinimized}
          <!-- Expanded playback controls and scrub bar -->
          <div class="mt-3 border-t border-(--color-line) pt-3">
            <!-- Scrub Slider -->
            <div class="flex items-center gap-2">
              <span class="w-10 text-right text-[11px] font-mono text-(--color-ink-muted)">
                {formatTime(audiobook.progressSeconds)}
              </span>
              <input
                type="range"
                min="0"
                max={audiobook.totalSeconds}
                value={audiobook.progressSeconds}
                oninput={(e) => audiobook.seek(Number((e.target as HTMLInputElement).value))}
                class="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-(--color-line) accent-(--color-primary)"
              />
              <span class="w-10 text-[11px] font-mono text-(--color-ink-muted)">
                {formatTime(audiobook.totalSeconds)}
              </span>
            </div>

            <div class="mt-2.5 flex items-center justify-between">
              <!-- Playback Speed -->
              <button
                type="button"
                onclick={() => audiobook.cycleSpeed()}
                class="rounded-md border border-(--color-line) px-2 py-1 text-xs font-semibold text-(--color-ink-secondary) hover:bg-(--color-elevated)"
              >
                {audiobook.playbackSpeed}x Speed
              </button>

              <!-- Skip Controls -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick={() => audiobook.skip(-15)}
                  class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-(--color-ink-secondary) hover:bg-(--color-elevated)"
                  title="Rewind 15 seconds"
                >
                  <RotateCcw class="size-3.5" />
                  <span>15s</span>
                </button>

                <button
                  type="button"
                  onclick={() => audiobook.skip(15)}
                  class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-(--color-ink-secondary) hover:bg-(--color-elevated)"
                  title="Forward 15 seconds"
                >
                  <span>15s</span>
                  <RotateCw class="size-3.5" />
                </button>
              </div>

              <!-- Campus Audio Stream Badge -->
              <div class="flex items-center gap-1 text-[11px] text-(--color-ink-muted)">
                <Volume2 class="size-3.5 text-(--color-emerald)" />
                <span class="hidden sm:inline">Northgate HD</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </aside>
{/if}
