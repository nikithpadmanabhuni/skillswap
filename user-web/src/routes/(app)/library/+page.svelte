<script lang="ts">
  import {
    BookOpen,
    Search,
    GraduationCap,
    Bot,
    Award,
    Clock,
    RotateCw,
    CheckCircle2,
    AlertCircle,
    Headphones,
    FileText,
    Star,
    Building2,
    Calendar,
    Quote,
    Layers,
    BookCheck,
    Send,
    Filter
  } from 'lucide-svelte';
  import type { Book, Loan, BorrowRequest, LibraryBranch } from '$shared/types';
  import { libraryStore, BRANCH_COLORS, currentUser } from '$shared/mock';
  import { audiobook } from '$lib/audiobook.svelte';
  import BookDetailModal from '$lib/components/library/BookDetailModal.svelte';
  import CitationModal from '$lib/components/library/CitationModal.svelte';
  import DigitalReaderModal from '$lib/components/library/DigitalReaderModal.svelte';
  import CourseReservesModal from '$lib/components/library/CourseReservesModal.svelte';
  import ReferenceDeskSheet from '$lib/components/library/ReferenceDeskSheet.svelte';
  import ClearanceCertificateModal from '$lib/components/library/ClearanceCertificateModal.svelte';

  // Current student session context
  const studentRoll = '21CS042';
  const studentName = currentUser?.name || 'Aarav Mehta';
  const studentBranch = 'CSE';

  // Page state
  let searchQuery = $state('');
  let selectedBranch = $state<string>('ALL');
  let selectedFormat = $state<'ALL' | 'Physical' | 'E-Book' | 'Audiobook'>('ALL');
  let activeTab = $state<'catalog' | 'loans' | 'requests'>('catalog');

  // Modals state
  let selectedBook = $state<Book | null>(null);
  let isDetailModalOpen = $state(false);
  let isCiteModalOpen = $state(false);
  let isReaderModalOpen = $state(false);
  let isReservesModalOpen = $state(false);
  let isReferenceSheetOpen = $state(false);
  let isClearanceModalOpen = $state(false);

  // Toast feedback state
  let toastMessage = $state<string | null>(null);

  function showToast(msg: string) {
    toastMessage = msg;
    setTimeout(() => {
      if (toastMessage === msg) toastMessage = null;
    }, 4000);
  }

  // Reactive data from store
  let books = $state(libraryStore.getBooks());
  let myLoans = $state(libraryStore.getMyLoans(studentRoll));
  let myRequests = $state(libraryStore.getMyBorrowRequests(studentRoll));

  function refreshData() {
    books = libraryStore.getBooks();
    myLoans = libraryStore.getMyLoans(studentRoll);
    myRequests = libraryStore.getMyBorrowRequests(studentRoll);
  }

  const branches = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&DS'];

  let filteredBooks = $derived(
    books.filter((b) => {
      const matchBranch = selectedBranch === 'ALL' || b.genre === selectedBranch;
      const matchFormat =
        selectedFormat === 'ALL' ||
        (selectedFormat === 'Physical' && b.format === 'Physical') ||
        (selectedFormat === 'E-Book' && b.hasEbook) ||
        (selectedFormat === 'Audiobook' && b.hasAudio);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q);
      return matchBranch && matchFormat && matchQuery;
    })
  );

  function openDetail(book: Book) {
    selectedBook = book;
    isDetailModalOpen = true;
  }

  function openCite(book: Book) {
    selectedBook = book;
    isCiteModalOpen = true;
  }

  function openReader(book: Book) {
    selectedBook = book;
    isReaderModalOpen = true;
  }

  function handleRenew(loan: Loan) {
    const res = libraryStore.renewLoan(loan.id);
    refreshData();
    showToast(res.message);
  }

  function handleReturn(loan: Loan) {
    const res = libraryStore.returnLoan(loan.id);
    refreshData();
    showToast(res.message);
  }

  function handleSelectCourseBook(bookId: string) {
    const b = libraryStore.getBook(bookId);
    if (b) {
      openDetail(b);
    }
  }

  function isOverdue(dueDateStr: string): boolean {
    return new Date(dueDateStr) < new Date();
  }

  function daysLeft(dueDateStr: string): number {
    const diffMs = new Date(dueDateStr).getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
</script>

<svelte:head>
  <title>Library & Academic Hub | SkillSwap Campus</title>
</svelte:head>

<div class="space-y-6">
  <!-- Toast alert -->
  {#if toastMessage}
    <div
      role="status"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-(--color-primary)/30 bg-(--color-card) px-4 py-3 text-xs font-bold text-(--color-ink) shadow-xl backdrop-blur-md animate-fade-in"
    >
      <CheckCircle2 class="size-4 text-(--color-emerald)" />
      <span>{toastMessage}</span>
    </div>
  {/if}

  <!-- Header Banner -->
  <div
    class="relative overflow-hidden rounded-3xl border border-(--color-line) bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl"
  >
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-bold text-indigo-300">
            University Library & Knowledge Repository
          </span>
          <span class="text-xs text-slate-400 font-mono">Roll: {studentRoll}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Northgate Academic Library
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Search over 65,000+ volumes, reserve course textbooks, read digital chapters, stream academic audiobooks, and generate certified citations.
        </p>

        <!-- Student Activity Badges -->
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onclick={() => (activeTab = 'loans')}
            class="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-xs transition"
          >
            <Clock class="size-3.5 text-amber-400" />
            <span>Active Loans: <strong class="text-white">{myLoans.length}</strong></span>
          </button>

          <button
            type="button"
            onclick={() => (activeTab = 'requests')}
            class="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-xs transition"
          >
            <Send class="size-3.5 text-cyan-400" />
            <span>Borrow Requests: <strong class="text-white">{myRequests.length}</strong></span>
          </button>

          <button
            type="button"
            onclick={() => (isClearanceModalOpen = true)}
            class="flex items-center gap-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-xs transition"
          >
            <CheckCircle2 class="size-3.5" />
            <span>No-Dues Clearance: {myLoans.length === 0 ? 'Eligible' : `${myLoans.length} Pending`}</span>
          </button>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
        <button
          type="button"
          onclick={() => (isReservesModalOpen = true)}
          class="flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-xs font-extrabold shadow-md hover:bg-slate-100 active:scale-98 transition"
        >
          <GraduationCap class="size-4 text-(--color-brand)" />
          <span>Course Reserves & Papers</span>
        </button>

        <button
          type="button"
          onclick={() => (isReferenceSheetOpen = true)}
          class="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur-xs active:scale-98 transition"
        >
          <Bot class="size-4 text-cyan-300" />
          <span>AI Reference Desk</span>
        </button>

        <button
          type="button"
          onclick={() => (isClearanceModalOpen = true)}
          class="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur-xs active:scale-98 transition"
        >
          <Award class="size-4 text-amber-300" />
          <span>Clearance Certificate</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Navigation Tabs: Catalog / Active Loans / My Requests -->
  <div class="flex items-center justify-between border-b border-(--color-line) pb-2">
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => (activeTab = 'catalog')}
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition {activeTab === 'catalog'
          ? 'bg-(--color-primary) text-white shadow-xs'
          : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
      >
        <BookOpen class="size-4" />
        <span>Library Catalog ({books.length})</span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = 'loans')}
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition {activeTab === 'loans'
          ? 'bg-(--color-primary) text-white shadow-xs'
          : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
      >
        <Clock class="size-4" />
        <span>My Active Loans ({myLoans.length})</span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = 'requests')}
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition {activeTab === 'requests'
          ? 'bg-(--color-primary) text-white shadow-xs'
          : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
      >
        <Send class="size-4" />
        <span>My Requests ({myRequests.length})</span>
      </button>
    </div>
  </div>

  <!-- TAB 1: Catalog -->
  {#if activeTab === 'catalog'}
    <div class="space-y-4">
      <!-- Search & Filter Controls -->
      <div class="flex flex-col md:flex-row gap-3">
        <!-- Search bar -->
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--color-ink-muted)" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or topic..."
            bind:value={searchQuery}
            class="w-full rounded-2xl border border-(--color-line) bg-(--color-card) py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        <!-- Format filter pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {#each ['ALL', 'Physical', 'E-Book', 'Audiobook'] as fmt}
            <button
              type="button"
              onclick={() => (selectedFormat = fmt as typeof selectedFormat)}
              class="rounded-xl px-3 py-2 text-xs font-bold transition whitespace-nowrap {selectedFormat === fmt
                ? 'bg-(--color-primary) text-white shadow-xs'
                : 'border border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
            >
              {fmt}
            </button>
          {/each}
        </div>
      </div>

      <!-- Department Branch Filters -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2">
        <span class="text-xs font-bold text-(--color-ink-muted) flex items-center gap-1 pr-1">
          <Filter class="size-3.5" /> Branch:
        </span>
        {#each branches as branch}
          {@const color = BRANCH_COLORS[branch] || '#6366F1'}
          <button
            type="button"
            onclick={() => (selectedBranch = branch)}
            class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap {selectedBranch === branch
              ? 'bg-(--color-card) border-2 text-(--color-ink) shadow-xs'
              : 'border border-(--color-line) bg-(--color-elevated) text-(--color-ink-secondary) hover:bg-(--color-card)'}"
            style={selectedBranch === branch ? `border-color: ${color};` : ''}
          >
            {#if branch !== 'ALL'}
              <span class="size-2 rounded-full" style="background-color: {color};"></span>
            {/if}
            <span>{branch}</span>
          </button>
        {/each}
      </div>

      <!-- Catalog Books Grid -->
      {#if filteredBooks.length === 0}
        <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-12 text-center">
          <BookOpen class="mx-auto size-10 text-(--color-ink-muted) opacity-50 mb-3" />
          <h3 class="text-sm font-bold text-(--color-ink)">No Books Found</h3>
          <p class="text-xs text-(--color-ink-muted) mt-1">
            Try adjusting your search query, format filters, or branch selection.
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredBooks as book (book.id)}
            {@const branchColor = BRANCH_COLORS[book.genre] || '#2563EB'}
            <div
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-card) shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-(--color-primary)/50"
            >
              <!-- Gradient Cover Card Top -->
              <div
                class="relative h-32 p-4 text-white flex flex-col justify-between"
                style="background: linear-gradient(135deg, {book.gradientColors[0]}, {book.gradientColors[1]});"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                    style="background-color: {branchColor};"
                  >
                    {book.genre}
                  </span>
                  <div class="flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-xs">
                    <Star class="size-3 fill-current" />
                    <span>{book.rating}</span>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-mono text-white/70">ISBN: {book.isbn}</span>
                  <h3 class="text-sm font-bold leading-snug line-clamp-2 text-white drop-shadow-xs">
                    {book.title}
                  </h3>
                </div>
              </div>

              <!-- Book Details Body -->
              <div class="flex-1 p-4 space-y-3">
                <p class="text-xs text-(--color-ink-muted)">By <span class="font-semibold text-(--color-ink)">{book.author}</span></p>

                <p class="text-xs text-(--color-ink-secondary) line-clamp-2 leading-relaxed">
                  {book.synopsis}
                </p>

                <!-- Availability Badge -->
                <div class="rounded-lg border border-(--color-line) bg-(--color-elevated) p-2 text-[11px]">
                  {#if book.branches.length > 0}
                    <div class="flex items-center justify-between font-semibold">
                      <span class="text-(--color-ink)">{book.branches[0].name}</span>
                      <span class="{book.branches[0].available > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600'}">
                        {book.branches[0].available} of {book.branches[0].total} Left
                      </span>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Card Action Bar -->
              <div class="flex items-center justify-between border-t border-(--color-line) bg-(--color-elevated)/40 p-3 gap-1.5">
                <button
                  type="button"
                  onclick={() => openDetail(book)}
                  class="flex-1 rounded-xl bg-(--color-primary) py-1.5 text-xs font-bold text-white shadow-2xs hover:opacity-95 transition"
                >
                  View Details
                </button>

                {#if book.hasEbook}
                  <button
                    type="button"
                    onclick={() => openReader(book)}
                    class="rounded-xl border border-(--color-line) bg-(--color-card) p-1.5 text-(--color-ink-secondary) hover:text-(--color-emerald) hover:bg-(--color-elevated) transition"
                    title="Read Digital Chapter"
                  >
                    <BookOpen class="size-4" />
                  </button>
                {/if}

                {#if book.hasAudio}
                  <button
                    type="button"
                    onclick={() => audiobook.play(book)}
                    class="rounded-xl border border-(--color-line) bg-(--color-card) p-1.5 text-(--color-ink-secondary) hover:text-(--color-brand) hover:bg-(--color-elevated) transition"
                    title="Listen to Audiobook"
                  >
                    <Headphones class="size-4" />
                  </button>
                {/if}

                <button
                  type="button"
                  onclick={() => openCite(book)}
                  class="rounded-xl border border-(--color-line) bg-(--color-card) p-1.5 text-(--color-ink-secondary) hover:text-(--color-primary) hover:bg-(--color-elevated) transition"
                  title="Generate Academic Citation"
                >
                  <Quote class="size-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 2: My Active Loans -->
  {:else if activeTab === 'loans'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-(--color-ink)">Active Borrowings on Student Record</h2>
          <p class="text-xs text-(--color-ink-muted)">
            Items must be returned or renewed prior to due date to avoid late clearance restrictions.
          </p>
        </div>
        <span class="rounded-full bg-(--color-primary)/10 px-3 py-1 text-xs font-bold text-(--color-primary)">
          {myLoans.length} Currently Checked Out
        </span>
      </div>

      {#if myLoans.length === 0}
        <div class="rounded-2xl border border-dashed border-(--color-line) bg-(--color-card) p-12 text-center">
          <BookCheck class="mx-auto size-12 text-emerald-500 mb-3" />
          <h3 class="text-sm font-bold text-(--color-ink)">No Active Loans</h3>
          <p class="text-xs text-(--color-ink-muted) mt-1">
            You have returned all library books! Your student account is 100% clear.
          </p>
          <button
            type="button"
            onclick={() => (isClearanceModalOpen = true)}
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Award class="size-4" />
            <span>Generate Clearance Certificate</span>
          </button>
        </div>
      {:else}
        <div class="space-y-3">
          {#each myLoans as loan (loan.id)}
            {@const overdue = isOverdue(loan.dueDate)}
            {@const days = daysLeft(loan.dueDate)}
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs hover:border-(--color-primary)/40 transition"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="rounded px-2 py-0.5 text-[10px] font-bold text-white bg-slate-800">
                    {loan.format}
                  </span>
                  <h3 class="text-sm font-bold text-(--color-ink)">{loan.title}</h3>
                </div>
                <p class="text-xs text-(--color-ink-muted)">By {loan.author}</p>
                <div class="flex items-center gap-3 text-xs pt-1">
                  <span class="text-(--color-ink-secondary)">
                    Due: <strong>{new Date(loan.dueDate).toLocaleDateString()}</strong>
                  </span>
                  <span class="font-bold {overdue ? 'text-(--color-danger)' : 'text-(--color-emerald)'}">
                    {overdue ? 'OVERDUE' : `${days} Days Remaining`}
                  </span>
                  <span class="text-[11px] text-(--color-ink-muted)">
                    Renewals Left: {loan.renewalsLeft}/2
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onclick={() => handleRenew(loan)}
                  disabled={loan.renewalsLeft <= 0}
                  class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-(--color-line) bg-(--color-elevated) px-3 py-2 text-xs font-bold text-(--color-ink) hover:bg-(--color-card) hover:border-(--color-primary) disabled:opacity-40 transition"
                >
                  <RotateCw class="size-3.5 text-(--color-primary)" />
                  <span>Renew (+14d)</span>
                </button>

                <button
                  type="button"
                  onclick={() => handleReturn(loan)}
                  class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-(--color-primary) px-4 py-2 text-xs font-bold text-white shadow-2xs hover:opacity-95 transition"
                >
                  <CheckCircle2 class="size-3.5" />
                  <span>Return Book</span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 3: My Borrow Requests -->
  {:else if activeTab === 'requests'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-(--color-ink)">Submitted Borrow Requests</h2>
          <p class="text-xs text-(--color-ink-muted)">
            Librarians approve pending requests and prepare books at the circulation desk.
          </p>
        </div>
      </div>

      {#if myRequests.length === 0}
        <div class="rounded-2xl border border-dashed border-(--color-line) bg-(--color-card) p-12 text-center">
          <Send class="mx-auto size-10 text-(--color-ink-muted) mb-2" />
          <h3 class="text-sm font-bold text-(--color-ink)">No Requests Found</h3>
          <p class="text-xs text-(--color-ink-muted) mt-1">
            Browse the catalog and click "Request Borrow" on any book to reserve it.
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each myRequests as req (req.id)}
            <div
              class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs hover:border-(--color-primary)/40 transition"
            >
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style="background-color: {BRANCH_COLORS[req.bookBranch] || '#2563EB'};"
                  >
                    {req.bookBranch}
                  </span>
                  <h3 class="text-sm font-bold text-(--color-ink)">{req.bookTitle}</h3>
                </div>

                <!-- Status pill -->
                <span
                  class="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider {req.status ===
                  'approved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : req.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}"
                >
                  {req.status}
                </span>
              </div>

              <p class="text-xs text-(--color-ink-muted)">
                By {req.bookAuthor} • Requested on {new Date(req.requestDate).toLocaleDateString()}
              </p>

              {#if req.status === 'approved'}
                <div class="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  ✓ Your book has been prepared and issued! Pick up at the Central Library Circulation Counter.
                </div>
              {:else if req.status === 'rejected' && req.rejectionReason}
                <div class="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                  Note from Librarian: {req.rejectionReason}
                </div>
              {:else}
                <div class="mt-3 text-xs text-(--color-ink-secondary)">
                  Waiting for librarian review and inventory allocation.
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Modals -->
<BookDetailModal
  bind:open={isDetailModalOpen}
  book={selectedBook}
  {studentRoll}
  {studentName}
  {studentBranch}
  onOpenCite={openCite}
  onOpenReader={openReader}
  onRequestSuccess={(msg) => {
    refreshData();
    showToast(msg);
  }}
/>

<CitationModal bind:open={isCiteModalOpen} book={selectedBook} />

<DigitalReaderModal bind:open={isReaderModalOpen} book={selectedBook} />

<CourseReservesModal
  bind:open={isReservesModalOpen}
  onSelectBook={handleSelectCourseBook}
/>

<ReferenceDeskSheet bind:open={isReferenceSheetOpen} />

<ClearanceCertificateModal
  bind:open={isClearanceModalOpen}
  {studentRoll}
  {studentName}
  department="Computer Science & Engineering"
/>
