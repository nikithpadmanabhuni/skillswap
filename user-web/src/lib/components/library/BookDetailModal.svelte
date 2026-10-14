<script lang="ts">
  import {
    BookOpen,
    Headphones,
    Quote,
    Building,
    Calendar,
    FileText,
    Star,
    Check,
    AlertCircle,
    BookmarkCheck,
    Send
  } from 'lucide-svelte';
  import type { Book } from '$shared/types';
  import { libraryStore, BRANCH_COLORS } from '$shared/mock';
  import { Dialog, Button } from '$shared/components/ui';
  import { audiobook } from '$lib/audiobook.svelte';

  let {
    open = $bindable(false),
    book,
    studentRoll = '21CS042',
    studentName = 'Aarav Mehta',
    studentBranch = 'CSE',
    onOpenCite,
    onOpenReader,
    onRequestSuccess
  }: {
    open: boolean;
    book: Book | null;
    studentRoll?: string;
    studentName?: string;
    studentBranch?: string;
    onOpenCite?: (b: Book) => void;
    onOpenReader?: (b: Book) => void;
    onRequestSuccess?: (msg: string) => void;
  } = $props();

  let isRequesting = $state(false);
  let requested = $state(false);

  function handleRequestBorrow() {
    if (!book) return;
    isRequesting = true;
    setTimeout(() => {
      libraryStore.submitBorrowRequest({
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookIsbn: book.isbn,
        bookBranch: book.genre,
        studentRoll,
        studentName,
        studentBranch,
        studentPhone: '+91 98765 43210'
      });
      isRequesting = false;
      requested = true;
      if (onRequestSuccess) {
        onRequestSuccess(`Borrow request for "${book.title}" submitted to Librarian Desk.`);
      }
      setTimeout(() => {
        requested = false;
      }, 4000);
    }, 300);
  }

  function handleListenAudio() {
    if (!book) return;
    audiobook.play(book);
  }
</script>

<Dialog bind:open title={book?.title ?? 'Book Details'} size="lg">
  {#if book}
    <div class="space-y-4">
      <!-- Gradient Hero Banner -->
      <div
        class="relative overflow-hidden rounded-2xl p-5 text-white shadow-md"
        style="background: linear-gradient(135deg, {book.gradientColors[0]}, {book.gradientColors[1]});"
      >
        <div class="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span
                class="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/20 backdrop-blur-xs"
              >
                {book.genre}
              </span>
              <span class="rounded-md px-2 py-0.5 text-[10px] font-bold text-white/80 bg-black/20">
                {book.format}
              </span>
            </div>
            <h2 class="text-base sm:text-lg font-black leading-tight text-white">{book.title}</h2>
            <p class="text-xs text-white/80 mt-0.5">By {book.author}</p>
          </div>

          <!-- Rating & Year Pill -->
          <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-right">
            <div class="flex items-center gap-1 bg-amber-400/20 text-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold">
              <Star class="size-3.5 fill-current" />
              <span>{book.rating}</span>
              <span class="text-[10px] text-white/70">({book.reviewsCount})</span>
            </div>
            <p class="text-[11px] text-white/70">Published {book.publishYear}</p>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons Row -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onclick={handleRequestBorrow}
          disabled={isRequesting || requested}
          class="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-(--color-primary) py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-98 transition disabled:opacity-50"
        >
          {#if requested}
            <Check class="size-4" />
            <span>Request Submitted</span>
          {:else}
            <Send class="size-4" />
            <span>Request Borrow</span>
          {/if}
        </button>

        {#if onOpenCite}
          <button
            type="button"
            onclick={() => onOpenCite(book)}
            class="flex items-center gap-1.5 rounded-xl border border-(--color-line) bg-(--color-card) py-2.5 px-3.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-elevated) active:scale-98 transition shadow-2xs"
          >
            <Quote class="size-4 text-(--color-primary)" />
            <span>Cite Book</span>
          </button>
        {/if}

        {#if book.hasEbook && onOpenReader}
          <button
            type="button"
            onclick={() => onOpenReader(book)}
            class="flex items-center gap-1.5 rounded-xl border border-(--color-line) bg-(--color-card) py-2.5 px-3.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-elevated) active:scale-98 transition shadow-2xs"
          >
            <BookOpen class="size-4 text-(--color-emerald)" />
            <span>Read Chapter</span>
          </button>
        {/if}

        {#if book.hasAudio}
          <button
            type="button"
            onclick={handleListenAudio}
            class="flex items-center gap-1.5 rounded-xl border border-(--color-line) bg-(--color-card) py-2.5 px-3.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-elevated) active:scale-98 transition shadow-2xs"
          >
            <Headphones class="size-4 text-(--color-brand)" />
            <span>Listen Audio</span>
          </button>
        {/if}
      </div>

      <!-- Synopsis -->
      <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-(--color-ink-muted) mb-1.5">
          Synopsis & Overview
        </h3>
        <p class="text-xs leading-relaxed text-(--color-ink-secondary)">
          {book.synopsis}
        </p>
      </div>

      <!-- Branch Availability & Call Numbers -->
      <div class="rounded-xl border border-(--color-line) bg-(--color-elevated) p-3.5">
        <h3 class="text-xs font-bold uppercase tracking-wider text-(--color-ink-muted) mb-2.5 flex items-center gap-1.5">
          <Building class="size-3.5 text-(--color-primary)" />
          <span>Library Holdings & Shelf Locations</span>
        </h3>
        <div class="space-y-2">
          {#each book.branches as br}
            <div class="flex items-center justify-between rounded-lg bg-(--color-card) p-2.5 border border-(--color-line) text-xs">
              <div>
                <p class="font-bold text-(--color-ink)">{br.name}</p>
                <p class="font-mono text-[11px] text-(--color-ink-muted)">Call No: {br.callNumber}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 text-[11px] font-bold {br.available > 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}">
                {br.available} of {br.total} Available
              </span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Metadata summary -->
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div class="rounded-lg border border-(--color-line) bg-(--color-card) p-2">
          <p class="text-[10px] text-(--color-ink-muted) uppercase">ISBN</p>
          <p class="font-mono font-bold text-(--color-ink) truncate">{book.isbn}</p>
        </div>
        <div class="rounded-lg border border-(--color-line) bg-(--color-card) p-2">
          <p class="text-[10px] text-(--color-ink-muted) uppercase">Page Count</p>
          <p class="font-bold text-(--color-ink)">{book.pages} Pages</p>
        </div>
        <div class="rounded-lg border border-(--color-line) bg-(--color-card) p-2">
          <p class="text-[10px] text-(--color-ink-muted) uppercase">Publisher</p>
          <p class="font-bold text-(--color-ink)">Apex Press</p>
        </div>
      </div>

      <!-- Reviews -->
      {#if book.reviews.length > 0}
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-(--color-ink-muted) mb-2">
            Student Reviews ({book.reviews.length})
          </h3>
          <div class="space-y-2">
            {#each book.reviews as rev}
              <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-3 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-(--color-ink)">{rev.userName}</span>
                  <div class="flex items-center gap-0.5 text-amber-500">
                    {#each Array(rev.rating) as _}
                      <Star class="size-3 fill-current" />
                    {/each}
                  </div>
                </div>
                <p class="text-(--color-ink-secondary)">{rev.comment}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)}>Close</Button>
  {/snippet}
</Dialog>
