<script lang="ts">
  import {
    GraduationCap,
    FileText,
    BookOpen,
    Download,
    CheckCircle2,
    Calendar,
    Search,
    BookCheck
  } from 'lucide-svelte';
  import type { CourseReserve, PastExamPaper } from '$shared/types';
  import { libraryStore } from '$shared/mock';
  import { Dialog, Button } from '$shared/components/ui';

  let {
    open = $bindable(false),
    onSelectBook
  }: {
    open: boolean;
    onSelectBook?: (bookId: string) => void;
  } = $props();

  let activeTab = $state<'reserves' | 'papers'>('reserves');
  let selectedDept = $state<string>('ALL');
  let searchQuery = $state<string>('');

  const departments = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&DS'];

  let courseReserves = $derived(libraryStore.getCourseReserves());
  let pastPapers = $derived(libraryStore.getPastPapers());

  let filteredReserves = $derived(
    courseReserves.filter((r) => {
      const matchDept = selectedDept === 'ALL' || r.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.courseCode.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        r.instructor.toLowerCase().includes(q) ||
        r.requiredBookTitle.toLowerCase().includes(q);
      return matchDept && matchQuery;
    })
  );

  let filteredPapers = $derived(
    pastPapers.filter((p) => {
      const matchDept = selectedDept === 'ALL' || p.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.courseCode.toLowerCase().includes(q) ||
        p.courseTitle.toLowerCase().includes(q) ||
        p.instructor.toLowerCase().includes(q);
      return matchDept && matchQuery;
    })
  );
</script>

<Dialog bind:open title="Course Reserves & Exam Archive" size="lg">
  <div class="space-y-4">
    <!-- Top tab switcher -->
    <div class="flex rounded-xl border border-(--color-line) bg-(--color-elevated) p-1">
      <button
        type="button"
        onclick={() => (activeTab = 'reserves')}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all {activeTab ===
        'reserves'
          ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
          : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
      >
        <GraduationCap class="size-4" />
        <span>Syllabus Course Reserves ({courseReserves.length})</span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = 'papers')}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all {activeTab ===
        'papers'
          ? 'bg-(--color-card) text-(--color-primary) shadow-xs'
          : 'text-(--color-ink-muted) hover:text-(--color-ink)'}"
      >
        <FileText class="size-4" />
        <span>Past Exam Papers & Solutions ({pastPapers.length})</span>
      </button>
    </div>

    <!-- Department filters and search -->
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-(--color-ink-muted)" />
        <input
          type="text"
          placeholder="Search by course code, professor, or title..."
          bind:value={searchQuery}
          class="w-full rounded-xl border border-(--color-line) bg-(--color-card) py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        />
      </div>

      <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
        {#each departments as dept}
          <button
            type="button"
            onclick={() => (selectedDept = dept)}
            class="rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition {selectedDept === dept
              ? 'bg-(--color-primary) text-white'
              : 'border border-(--color-line) bg-(--color-card) text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
          >
            {dept}
          </button>
        {/each}
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
      {#if activeTab === 'reserves'}
        {#if filteredReserves.length === 0}
          <div class="p-8 text-center text-xs text-(--color-ink-muted)">
            No course reserves found for the selected department.
          </div>
        {:else}
          {#each filteredReserves as reserve}
            <div
              class="rounded-xl border border-(--color-line) bg-(--color-card) p-4 shadow-2xs transition hover:border-(--color-primary)/50"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="rounded-md bg-(--color-primary)/10 px-2 py-0.5 font-mono text-xs font-bold text-(--color-primary)">
                    {reserve.courseCode}
                  </span>
                  <span class="text-xs font-bold text-(--color-ink)">{reserve.courseTitle}</span>
                </div>
                <span class="rounded-full bg-(--color-emerald)/10 px-2.5 py-0.5 text-[11px] font-bold text-(--color-emerald)">
                  {reserve.reserveCopiesOnShelf} On-Shelf Desk Copies
                </span>
              </div>

              <div class="mt-2 text-xs text-(--color-ink-muted)">
                <span>Instructor: <strong class="text-(--color-ink)">{reserve.instructor}</strong></span>
                <span class="mx-2">•</span>
                <span>{reserve.semester}</span>
              </div>

              <div class="mt-3 rounded-lg border border-(--color-line) bg-(--color-elevated) p-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <BookCheck class="size-4 text-(--color-primary)" />
                    <span class="text-xs font-bold text-(--color-ink)">
                      Required Text: {reserve.requiredBookTitle}
                    </span>
                  </div>
                  {#if onSelectBook}
                    <button
                      type="button"
                      onclick={() => {
                        open = false;
                        onSelectBook(reserve.requiredBookId);
                      }}
                      class="text-xs font-bold text-(--color-primary) hover:underline"
                    >
                      View in Catalog →
                    </button>
                  {/if}
                </div>
                <p class="mt-1.5 text-xs text-(--color-ink-secondary) leading-relaxed">
                  {reserve.syllabusNotes}
                </p>
              </div>
            </div>
          {/each}
        {/if}
      {:else}
        {#if filteredPapers.length === 0}
          <div class="p-8 text-center text-xs text-(--color-ink-muted)">
            No past exam papers found matching your search.
          </div>
        {:else}
          {#each filteredPapers as paper}
            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--color-line) bg-(--color-card) p-3.5 shadow-2xs hover:border-(--color-primary)/40 transition"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-(--color-ink)">
                    {paper.courseCode}
                  </span>
                  <span class="truncate text-xs font-bold text-(--color-ink)">
                    {paper.courseTitle}
                  </span>
                  <span class="rounded px-1.5 py-0.5 text-[10px] font-bold text-(--color-ink-muted) border border-(--color-line)">
                    {paper.term} {paper.year}
                  </span>
                </div>
                <p class="mt-1 text-xs text-(--color-ink-secondary)">
                  Instructor: {paper.instructor} • Northgate Examination Board
                </p>
              </div>

              <div class="flex items-center gap-2">
                {#if paper.hasSolutionKey}
                  <span class="flex items-center gap-1 text-[11px] font-bold text-(--color-emerald)">
                    <CheckCircle2 class="size-3.5" />
                    Solution Included
                  </span>
                {/if}
                <button
                  type="button"
                  onclick={() => alert(`Simulating PDF download for ${paper.courseCode} (${paper.term} ${paper.year}) Examination Archive.`)}
                  class="flex items-center gap-1.5 rounded-lg border border-(--color-line) bg-(--color-card) px-3 py-1.5 text-xs font-bold text-(--color-primary) shadow-xs hover:bg-(--color-elevated) active:scale-95 transition"
                >
                  <Download class="size-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </div>

  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)}>Close</Button>
  {/snippet}
</Dialog>
