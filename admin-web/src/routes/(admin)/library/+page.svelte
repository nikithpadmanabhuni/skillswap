<script lang="ts">
  import {
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    Plus,
    Search,
    Trash2,
    Building2,
    UserCheck,
    AlertTriangle,
    Layers,
    Send,
    Filter,
    ArrowRightLeft,
    ShieldCheck
  } from 'lucide-svelte';
  import type { Book, BorrowRequest, Loan, LibraryBranch } from '$shared/types';
  import { libraryStore, BRANCH_COLORS } from '$shared/mock';
  import { Button, Dialog, Badge } from '$shared/components/ui';

  // State
  let activeTab = $state<'requests' | 'circulation' | 'catalog' | 'clearance'>('requests');
  let requestFilter = $state<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Add Book Dialog State
  let isAddBookOpen = $state(false);
  let newTitle = $state('');
  let newAuthor = $state('');
  let newBranch = $state<string>('CSE');
  let newFormat = $state<'Physical' | 'E-Book' | 'Audiobook'>('Physical');
  let newIsbn = $state('');
  let newCopies = $state(5);
  let newPages = $state(450);
  let newYear = $state(2024);
  let newSynopsis = $state('');

  // Quick Issue State
  let issueBookId = $state('');
  let issueStudentRoll = $state('');
  let issueStudentName = $state('');

  // Student Clearance Lookup State
  let lookupRoll = $state('');
  let searchedClearance = $state<ReturnType<typeof libraryStore.getStudentClearance> | null>(null);

  // Reject Request Modal State
  let rejectModalOpen = $state(false);
  let rejectTargetReq = $state<BorrowRequest | null>(null);
  let rejectReason = $state('Requested book is currently reserved on-shelf for course curriculum.');

  // Toast State
  let toastMsg = $state<string | null>(null);

  function notify(msg: string) {
    toastMsg = msg;
    setTimeout(() => {
      if (toastMsg === msg) toastMsg = null;
    }, 4000);
  }

  // Reactive store data
  let books = $state(libraryStore.getBooks());
  let allLoans = $state(libraryStore.getAllLoans());
  let requests = $state(libraryStore.getBorrowRequests());
  let stats = $state(libraryStore.getLibraryStats());

  function refresh() {
    books = libraryStore.getBooks();
    allLoans = libraryStore.getAllLoans();
    requests = libraryStore.getBorrowRequests();
    stats = libraryStore.getLibraryStats();
  }

  let filteredRequests = $derived(
    requests.filter((r) => {
      if (requestFilter === 'ALL') return true;
      return r.status.toUpperCase() === requestFilter;
    })
  );

  // Actions
  function handleApproveRequest(req: BorrowRequest) {
    const res = libraryStore.approveBorrowRequest(req.id);
    refresh();
    notify(res.message);
  }

  function openRejectModal(req: BorrowRequest) {
    rejectTargetReq = req;
    rejectModalOpen = true;
  }

  function confirmReject() {
    if (!rejectTargetReq) return;
    const res = libraryStore.rejectBorrowRequest(rejectTargetReq.id, rejectReason);
    rejectModalOpen = false;
    rejectTargetReq = null;
    refresh();
    notify(res.message);
  }

  function handleQuickIssue() {
    if (!issueBookId || !issueStudentRoll || !issueStudentName) {
      notify('Please fill in Book, Student Roll, and Student Name.');
      return;
    }
    const res = libraryStore.issueBookDirect(issueBookId, issueStudentRoll, issueStudentName);
    if (res.success) {
      issueBookId = '';
      issueStudentRoll = '';
      issueStudentName = '';
      refresh();
    }
    notify(res.message);
  }

  function handleCheckIn(loan: Loan) {
    const res = libraryStore.returnLoan(loan.id);
    refresh();
    notify(res.message);
  }

  function handleSaveNewBook() {
    if (!newTitle.trim() || !newAuthor.trim()) {
      notify('Please enter title and author.');
      return;
    }
    libraryStore.saveBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      genre: newBranch,
      format: newFormat,
      hasEbook: newFormat === 'E-Book' || newFormat === 'Physical',
      hasAudio: newFormat === 'Audiobook',
      isbn: newIsbn.trim() || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      rating: 4.8,
      reviewsCount: 1,
      pages: Number(newPages) || 350,
      publishYear: Number(newYear) || 2024,
      gradientColors: ['#1E3A8A', '#0F172A'],
      synopsis: newSynopsis.trim() || 'Official university catalog volume for academic reference.',
      sampleChapter: '# Chapter 1: Course Principles\n\nComprehensive academic content.',
      branches: [
        {
          name: 'Central Academic Library',
          total: Number(newCopies) || 5,
          available: Number(newCopies) || 5,
          callNumber: `${newBranch}-${Math.floor(100 + Math.random() * 900)}`
        }
      ],
      reviews: []
    });

    isAddBookOpen = false;
    newTitle = '';
    newAuthor = '';
    newSynopsis = '';
    refresh();
    notify('New book successfully cataloged and added to active inventory.');
  }

  function handleDeleteBook(book: Book) {
    if (confirm(`Are you sure you want to delete "${book.title}" from library inventory?`)) {
      libraryStore.deleteBook(book.id);
      refresh();
      notify(`"${book.title}" removed from catalog.`);
    }
  }

  function handleClearanceSearch() {
    if (!lookupRoll.trim()) return;
    searchedClearance = libraryStore.getStudentClearance(
      lookupRoll.trim(),
      'Student Name (Verified)',
      'Engineering'
    );
  }
</script>

<svelte:head>
  <title>Librarian Circulation & Catalog Desk | Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Toast alert -->
  {#if toastMsg}
    <div
      role="status"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-(--color-primary)/30 bg-(--color-card) px-4 py-3 text-xs font-bold text-(--color-ink) shadow-xl backdrop-blur-md"
    >
      <CheckCircle2 class="size-4 text-(--color-emerald)" />
      <span>{toastMsg}</span>
    </div>
  {/if}

  <!-- Header Banner -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl sm:text-2xl font-black text-(--color-ink)">Librarian Circulation Desk</h1>
        <span class="rounded-full bg-(--color-primary)/10 px-2.5 py-0.5 text-xs font-bold text-(--color-primary)">
          Central Library Admin
        </span>
      </div>
      <p class="text-xs text-(--color-ink-muted) mt-0.5">
        Review student borrow requests, issue/return physical copies, catalog new volumes, and audit clearance.
      </p>
    </div>

    <Button onclick={() => (isAddBookOpen = true)}>
      <Plus class="size-4" /> Add Book to Catalog
    </Button>
  </div>

  <!-- Analytics KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-(--color-ink-muted)">Catalog Titles</span>
        <BookOpen class="size-4 text-(--color-primary)" />
      </div>
      <p class="mt-2 text-2xl font-black text-(--color-ink)">{stats.totalTitles}</p>
      <p class="text-[11px] text-(--color-ink-muted)">{stats.totalCopies} Total Copies ({stats.availableCopies} on shelf)</p>
    </div>

    <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-(--color-ink-muted)">Active Borrowings</span>
        <ArrowRightLeft class="size-4 text-emerald-600" />
      </div>
      <p class="mt-2 text-2xl font-black text-(--color-ink)">{stats.activeLoans}</p>
      <p class="text-[11px] text-emerald-600 font-semibold">Circulating on Campus</p>
    </div>

    <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-(--color-ink-muted)">Overdue Loans</span>
        <Clock class="size-4 text-(--color-danger)" />
      </div>
      <p class="mt-2 text-2xl font-black {stats.overdueLoans > 0 ? 'text-(--color-danger)' : 'text-(--color-ink)'}">
        {stats.overdueLoans}
      </p>
      <p class="text-[11px] text-(--color-danger) font-semibold">Notice Required</p>
    </div>

    <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-(--color-ink-muted)">Pending Requests</span>
        <Send class="size-4 text-amber-500" />
      </div>
      <p class="mt-2 text-2xl font-black text-(--color-ink)">{stats.pendingRequests}</p>
      <p class="text-[11px] text-amber-600 font-semibold">Awaiting Approval</p>
    </div>
  </div>

  <!-- Main Desk Navigation Tabs -->
  <div class="flex rounded-xl border border-(--color-line) bg-(--color-elevated) p-1">
    <button
      type="button"
      onclick={() => (activeTab = 'requests')}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all {activeTab ===
      'requests'
        ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
        : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
    >
      <Send class="size-4" />
      <span>Borrow Requests Queue ({requests.filter((r) => r.status === 'pending').length})</span>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = 'circulation')}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all {activeTab ===
      'circulation'
        ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
        : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
    >
      <ArrowRightLeft class="size-4" />
      <span>Issue & Return Circulation Desk</span>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = 'catalog')}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all {activeTab ===
      'catalog'
        ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
        : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
    >
      <BookOpen class="size-4" />
      <span>Catalog Inventory ({books.length})</span>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = 'clearance')}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all {activeTab ===
      'clearance'
        ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
        : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
    >
      <ShieldCheck class="size-4" />
      <span>No-Dues Clearance Audit</span>
    </button>
  </div>

  <!-- TAB 1: Borrow Requests Queue -->
  {#if activeTab === 'requests'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          {#each ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as f}
            <button
              type="button"
              onclick={() => (requestFilter = f as typeof requestFilter)}
              class="rounded-lg px-3 py-1.5 text-xs font-bold transition {requestFilter === f
                ? 'bg-(--color-primary) text-white'
                : 'border border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
            >
              {f}
            </button>
          {/each}
        </div>
      </div>

      {#if filteredRequests.length === 0}
        <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-12 text-center text-xs text-(--color-ink-muted)">
          No borrow requests found under "{requestFilter}".
        </div>
      {:else}
        <div class="space-y-3">
          {#each filteredRequests as req (req.id)}
            <div
              class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs hover:border-(--color-primary)/40 transition"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style="background-color: {BRANCH_COLORS[req.bookBranch] || '#2563EB'};"
                  >
                    {req.bookBranch}
                  </span>
                  <h3 class="text-sm font-bold text-(--color-ink)">{req.bookTitle}</h3>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider {req.status ===
                    'approved'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : req.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-amber-500/10 text-amber-600'}"
                  >
                    {req.status}
                  </span>
                </div>

                <p class="text-xs text-(--color-ink-muted)">
                  By {req.bookAuthor} • ISBN: {req.bookIsbn}
                </p>

                <div class="flex flex-wrap items-center gap-3 text-xs pt-1 text-(--color-ink-secondary)">
                  <span>Student: <strong class="text-(--color-ink)">{req.studentName}</strong></span>
                  <span>Roll: <strong class="font-mono text-(--color-ink)">{req.studentRoll}</strong></span>
                  <span>Branch: {req.studentBranch}</span>
                  <span>Phone: {req.studentPhone}</span>
                  <span class="text-[11px] text-(--color-ink-muted)">
                    Submitted {new Date(req.requestDate).toLocaleDateString()}
                  </span>
                </div>

                {#if req.rejectionReason}
                  <p class="text-xs text-rose-600 font-semibold pt-1">
                    Rejection Reason: {req.rejectionReason}
                  </p>
                {/if}
              </div>

              {#if req.status === 'pending'}
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onclick={() => handleApproveRequest(req)}
                    class="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition"
                  >
                    <CheckCircle2 class="size-3.5" />
                    <span>Approve & Issue</span>
                  </button>

                  <button
                    type="button"
                    onclick={() => openRejectModal(req)}
                    class="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 px-3.5 py-2 text-xs font-bold text-rose-600 transition"
                  >
                    <XCircle class="size-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 2: Circulation Desk (Quick Issue & Check-In) -->
  {:else if activeTab === 'circulation'}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Issue Panel -->
      <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-5 shadow-2xs space-y-4">
        <h2 class="text-sm font-bold text-(--color-ink) flex items-center gap-2">
          <ArrowRightLeft class="size-4 text-(--color-primary)" />
          <span>Quick Issue Book (21-Day Loan)</span>
        </h2>

        <div>
          <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Select Book from Inventory</span>
          <select
            bind:value={issueBookId}
            class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs font-medium focus:ring-2 focus:ring-(--color-primary)"
          >
            <option value="">-- Choose a title --</option>
            {#each books as b}
              {@const avail = b.branches.reduce((acc, br) => acc + br.available, 0)}
              <option value={b.id} disabled={avail <= 0}>
                {b.title} ({avail} avail)
              </option>
            {/each}
          </select>
        </div>

        <div>
          <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Student Roll Number</span>
          <input
            type="text"
            placeholder="e.g. 21CS042"
            bind:value={issueStudentRoll}
            class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs font-mono uppercase focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        <div>
          <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Student Full Name</span>
          <input
            type="text"
            placeholder="e.g. Aarav Mehta"
            bind:value={issueStudentName}
            class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        <Button class="w-full" onclick={handleQuickIssue}>
          Issue Book to Student
        </Button>
      </div>

      <!-- Active Circulation Table -->
      <div class="lg:col-span-2 rounded-2xl border border-(--color-line) bg-(--color-card) p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-(--color-ink)">Currently Circulating Campus Loans ({allLoans.length})</h2>
          <span class="text-xs text-(--color-ink-muted)">Click Check-In when returned</span>
        </div>

        {#if allLoans.length === 0}
          <div class="p-8 text-center text-xs text-(--color-ink-muted)">
            No items are currently checked out.
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-(--color-line) text-[11px] font-bold text-(--color-ink-muted) uppercase">
                <tr>
                  <th class="py-2">Book Title</th>
                  <th class="py-2">Student</th>
                  <th class="py-2">Due Date</th>
                  <th class="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-(--color-line)">
                {#each allLoans as loan}
                  {@const isOverdue = new Date(loan.dueDate) < new Date()}
                  <tr class="hover:bg-(--color-elevated)/40">
                    <td class="py-2.5 font-bold text-(--color-ink) max-w-[200px] truncate">
                      {loan.title}
                    </td>
                    <td class="py-2.5">
                      <p class="font-bold text-(--color-ink)">{loan.studentName}</p>
                      <p class="font-mono text-[10px] text-(--color-ink-muted)">{loan.studentRoll}</p>
                    </td>
                    <td class="py-2.5 font-medium {isOverdue ? 'text-rose-600 font-bold' : 'text-(--color-ink-secondary)'}">
                      {new Date(loan.dueDate).toLocaleDateString()}
                      {#if isOverdue}
                        <span class="ml-1 rounded bg-rose-500/10 px-1 py-0.5 text-[9px] font-extrabold uppercase">Overdue</span>
                      {/if}
                    </td>
                    <td class="py-2.5 text-right">
                      <button
                        type="button"
                        onclick={() => handleCheckIn(loan)}
                        class="rounded-lg bg-(--color-primary) px-3 py-1 text-xs font-bold text-white hover:opacity-90 shadow-2xs"
                      >
                        Check-In
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>

  <!-- TAB 3: Catalog Management -->
  {:else if activeTab === 'catalog'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-(--color-ink)">Catalog Management ({books.length} Titles)</h2>
        <Button size="sm" onclick={() => (isAddBookOpen = true)}>
          <Plus class="size-3.5" /> Add New Book
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each books as book}
          {@const branchColor = BRANCH_COLORS[book.genre] || '#2563EB'}
          <div class="rounded-2xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                  style="background-color: {branchColor};"
                >
                  {book.genre}
                </span>
                <span class="text-xs text-(--color-ink-muted) font-mono">ISBN: {book.isbn}</span>
              </div>
              <h3 class="text-sm font-bold text-(--color-ink) line-clamp-2">{book.title}</h3>
              <p class="text-xs text-(--color-ink-muted) mt-0.5">By {book.author}</p>
            </div>

            <div class="rounded-lg border border-(--color-line) bg-(--color-elevated) p-2 text-xs flex items-center justify-between">
              <span>Copies:</span>
              <span class="font-bold text-(--color-ink)">
                {book.branches.reduce((a, b) => a + b.available, 0)} / {book.branches.reduce((a, b) => a + b.total, 0)} On Shelf
              </span>
            </div>

            <div class="flex items-center justify-end border-t border-(--color-line) pt-2">
              <button
                type="button"
                onclick={() => handleDeleteBook(book)}
                class="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 p-1"
              >
                <Trash2 class="size-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

  <!-- TAB 4: Clearance Audit -->
  {:else if activeTab === 'clearance'}
    <div class="max-w-xl mx-auto rounded-2xl border border-(--color-line) bg-(--color-card) p-6 shadow-2xs space-y-4">
      <div class="flex items-center gap-3">
        <div class="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <ShieldCheck class="size-6" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-(--color-ink)">Student Clearance & No-Dues Verification</h2>
          <p class="text-xs text-(--color-ink-muted)">
            Verify student account standing for semester exams and convocation clearance.
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          type="text"
          placeholder="Enter student roll number (e.g. 21CS042)..."
          bind:value={lookupRoll}
          class="flex-1 rounded-xl border border-(--color-line) bg-(--color-card) p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-(--color-primary)"
        />
        <Button onclick={handleClearanceSearch}>
          <Search class="size-4" /> Audit Record
        </Button>
      </div>

      {#if searchedClearance}
        <div class="rounded-xl border p-4 text-xs space-y-3 {searchedClearance.isCleared
          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
          : 'border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'}">
          <div class="flex items-center justify-between font-bold">
            <span>Roll Number: <strong class="font-mono">{searchedClearance.studentRoll}</strong></span>
            <span class="uppercase tracking-wider {searchedClearance.isCleared ? 'text-emerald-600' : 'text-rose-600'}">
              {searchedClearance.isCleared ? '✓ Eligible for No-Dues' : '✗ Clearance Blocked'}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div class="rounded-lg bg-(--color-card) p-2 border border-(--color-line)">
              <span class="text-(--color-ink-muted)">Active Loans:</span>
              <p class="font-bold text-(--color-ink)">{searchedClearance.activeLoansCount} Books</p>
            </div>
            <div class="rounded-lg bg-(--color-card) p-2 border border-(--color-line)">
              <span class="text-(--color-ink-muted)">Outstanding Fines:</span>
              <p class="font-bold text-(--color-ink)">${searchedClearance.outstandingFines.toFixed(2)}</p>
            </div>
          </div>

          <p class="text-[11px] text-(--color-ink-secondary)">
            Reference ID: <strong class="font-mono">{searchedClearance.clearanceReferenceId}</strong>
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Modal: Add Book to Catalog -->
<Dialog bind:open={isAddBookOpen} title="Catalog New Volume" size="md">
  <div class="space-y-3">
    <div>
      <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Book Title</span>
      <input
        type="text"
        placeholder="e.g. Distributed Systems: Principles and Paradigms"
        bind:value={newTitle}
        class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
      />
    </div>

    <div>
      <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Author(s)</span>
      <input
        type="text"
        placeholder="e.g. Andrew S. Tanenbaum, Maarten van Steen"
        bind:value={newAuthor}
        class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Department Branch</span>
        <select
          bind:value={newBranch}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
        >
          {#each ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&DS'] as b}
            <option value={b}>{b}</option>
          {/each}
        </select>
      </div>

      <div>
        <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Format</span>
        <select
          bind:value={newFormat}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
        >
          <option value="Physical">Physical Print</option>
          <option value="E-Book">Digital E-Book</option>
          <option value="Audiobook">Audiobook</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div>
        <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Copies</span>
        <input
          type="number"
          min="1"
          bind:value={newCopies}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
        />
      </div>
      <div>
        <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Pages</span>
        <input
          type="number"
          min="10"
          bind:value={newPages}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
        />
      </div>
      <div>
        <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Year</span>
        <input
          type="number"
          min="1990"
          bind:value={newYear}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
        />
      </div>
    </div>

    <div>
      <span class="block text-xs font-bold text-(--color-ink-muted) mb-1">Synopsis</span>
      <textarea
        rows="3"
        placeholder="Brief description of the academic volume..."
        bind:value={newSynopsis}
        class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2 text-xs"
      ></textarea>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="outline" onclick={() => (isAddBookOpen = false)}>Cancel</Button>
    <Button onclick={handleSaveNewBook}>Save & Catalog Book</Button>
  {/snippet}
</Dialog>

<!-- Modal: Reject Borrow Request -->
<Dialog bind:open={rejectModalOpen} title="Reject Borrow Request" size="sm">
  <div class="space-y-3">
    <p class="text-xs text-(--color-ink-secondary)">
      Please provide a reason to notify the student why their request for
      <strong>"{rejectTargetReq?.bookTitle}"</strong> cannot be fulfilled:
    </p>
    <textarea
      rows="3"
      bind:value={rejectReason}
      class="w-full rounded-xl border border-(--color-line) bg-(--color-card) p-2.5 text-xs"
    ></textarea>
  </div>

  {#snippet footer()}
    <Button variant="outline" onclick={() => (rejectModalOpen = false)}>Cancel</Button>
    <Button variant="danger" onclick={confirmReject}>Confirm Rejection</Button>
  {/snippet}
</Dialog>
