<script lang="ts">
  import { Check, Copy, Quote, X } from 'lucide-svelte';
  import type { Book, CitationStyle } from '$shared/types';
  import { CitationService } from '$shared/utils/citations';
  import { Button, Dialog } from '$shared/components/ui';

  let {
    open = $bindable(false),
    book
  }: {
    open: boolean;
    book: Book | null;
  } = $props();

  let selectedStyle = $state<CitationStyle>('ieee');
  let copied = $state(false);

  const styles: CitationStyle[] = ['ieee', 'apa', 'bibtex', 'acm', 'mla', 'chicago'];

  let formattedText = $derived(
    book ? CitationService.formatCitation(book, selectedStyle) : ''
  );

  async function copyCitation() {
    if (!formattedText) return;
    try {
      await navigator.clipboard.writeText(formattedText);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2500);
    } catch {
      // Fallback
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2500);
    }
  }
</script>

<Dialog bind:open title="Academic Citation Generator" size="lg">
  {#if book}
    <div class="space-y-4">
      <div class="rounded-xl border border-(--color-line) bg-(--color-elevated) p-3">
        <p class="text-xs font-semibold text-(--color-ink-muted)">Target Resource</p>
        <p class="text-sm font-bold text-(--color-ink)">{book.title}</p>
        <p class="text-xs text-(--color-ink-secondary)">{book.author} ({book.publishYear})</p>
      </div>

      <!-- Format selector pills -->
      <div>
        <p class="mb-1.5 block text-xs font-bold text-(--color-ink-muted) uppercase tracking-wider">
          Select Citation Standard
        </p>
        <div class="flex flex-wrap gap-1.5">
          {#each styles as style}
            <button
              type="button"
              onclick={() => (selectedStyle = style)}
              class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all {selectedStyle === style
                ? 'bg-(--color-primary) text-white shadow-sm'
                : 'border border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
            >
              {CitationService.getStyleName(style)}
            </button>
          {/each}
        </div>
      </div>

      <!-- Formatted citation display -->
      <div class="relative rounded-xl border border-(--color-line) bg-(--color-card) p-4">
        <pre class="font-mono text-xs leading-relaxed text-(--color-ink) whitespace-pre-wrap select-all">{formattedText}</pre>
        <button
          type="button"
          onclick={copyCitation}
          class="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-(--color-line) bg-(--color-card) px-3 py-1.5 text-xs font-bold text-(--color-primary) shadow-sm hover:bg-(--color-elevated) active:scale-95 transition"
        >
          {#if copied}
            <Check class="size-3.5 text-(--color-emerald)" />
            <span class="text-(--color-emerald)">Copied!</span>
          {:else}
            <Copy class="size-3.5" />
            <span>Copy</span>
          {/if}
        </button>
      </div>

      <div class="flex items-center justify-between text-xs text-(--color-ink-muted)">
        <span>Official Northgate University Library Cataloging Authority</span>
        <span>Standard: ISO 690 / ANSI/NISO Z39.29</span>
      </div>
    </div>
  {/if}

  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)}>Close</Button>
    <Button onclick={copyCitation}>
      {#if copied}
        <Check class="size-4" /> Copied to Clipboard
      {:else}
        <Copy class="size-4" /> Copy Citation
      {/if}
    </Button>
  {/snippet}
</Dialog>
