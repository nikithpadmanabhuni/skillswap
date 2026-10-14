<script lang="ts">
  import {
    Award,
    CheckCircle2,
    AlertCircle,
    Printer,
    ShieldCheck,
    QrCode,
    Calendar,
    Building2,
    Stamp
  } from 'lucide-svelte';
  import type { StudentClearance } from '$shared/types';
  import { libraryStore } from '$shared/mock';
  import { Dialog, Button } from '$shared/components/ui';

  let {
    open = $bindable(false),
    studentRoll = '21CS042',
    studentName = 'Aarav Mehta',
    department = 'Computer Science & Engineering'
  }: {
    open: boolean;
    studentRoll?: string;
    studentName?: string;
    department?: string;
  } = $props();

  let clearance = $derived(
    libraryStore.getStudentClearance(studentRoll, studentName, department)
  );

  function printCertificate() {
    window.print();
  }
</script>

<Dialog bind:open title="University Library No-Dues Clearance" size="lg">
  <div class="space-y-4">
    {#if clearance.isCleared}
      <!-- Verified Official Certificate View -->
      <div
        id="printable-clearance-certificate"
        class="relative overflow-hidden rounded-2xl border-2 border-amber-600/30 bg-radial from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 shadow-sm"
      >
        <!-- Watermark / Seal background -->
        <div class="pointer-events-none absolute right-4 top-4 select-none opacity-5 dark:opacity-10">
          <Building2 class="size-64" />
        </div>

        <div class="relative z-10 text-center">
          <!-- University Header -->
          <div class="flex items-center justify-center gap-2">
            <span class="rounded-full bg-amber-600/10 p-2 text-amber-600">
              <Building2 class="size-6" />
            </span>
            <div class="text-left">
              <h2 class="text-sm font-extrabold uppercase tracking-widest text-(--color-ink)">
                Northgate University
              </h2>
              <p class="text-[10px] font-semibold tracking-wider text-(--color-ink-muted) uppercase">
                Central Library & Academic Information Services
              </p>
            </div>
          </div>

          <div class="my-4 inline-block rounded-full bg-emerald-500/10 px-4 py-1 border border-emerald-500/30">
            <span class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 class="size-4" />
              Digital Clearance Verified & Granted
            </span>
          </div>

          <p class="mx-auto max-w-md text-xs text-(--color-ink-secondary) leading-relaxed">
            This is to certify that <strong>{clearance.studentName}</strong> (Roll No: <span class="font-mono font-bold">{clearance.studentRoll}</span>), of the Department of <strong>{clearance.department}</strong>, has returned all university library books and has <strong>$0.00</strong> outstanding dues.
          </p>

          <!-- Clearance Metadata Grid -->
          <div class="my-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-2.5">
              <p class="text-[10px] font-bold text-(--color-ink-muted) uppercase">Roll Number</p>
              <p class="font-mono text-xs font-bold text-(--color-ink)">{clearance.studentRoll}</p>
            </div>
            <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-2.5">
              <p class="text-[10px] font-bold text-(--color-ink-muted) uppercase">Outstanding Books</p>
              <p class="text-xs font-bold text-emerald-600">0 Items (Cleared)</p>
            </div>
            <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-2.5">
              <p class="text-[10px] font-bold text-(--color-ink-muted) uppercase">Fines / Dues</p>
              <p class="text-xs font-bold text-emerald-600">$0.00 (Nil)</p>
            </div>
            <div class="rounded-xl border border-(--color-line) bg-(--color-card) p-2.5">
              <p class="text-[10px] font-bold text-(--color-ink-muted) uppercase">Academic Term</p>
              <p class="text-xs font-bold text-(--color-ink)">Fall 2026</p>
            </div>
          </div>

          <!-- Footer verification and signature stamp -->
          <div class="flex flex-col sm:flex-row items-center justify-between border-t border-(--color-line) pt-4 gap-4">
            <div class="flex items-center gap-3 text-left">
              <div class="grid size-12 place-items-center rounded-lg border border-(--color-line) bg-(--color-card) shadow-2xs">
                <QrCode class="size-8 text-(--color-ink-secondary)" />
              </div>
              <div class="text-[11px]">
                <p class="font-mono text-(--color-ink) font-bold">{clearance.clearanceReferenceId}</p>
                <p class="text-(--color-ink-muted)">SHA-256 Verifiable University Blockchain Entry</p>
              </div>
            </div>

            <div class="text-right">
              <p class="font-serif italic text-sm font-bold text-amber-700 dark:text-amber-400">
                Evelyn Reed
              </p>
              <p class="text-[10px] font-bold text-(--color-ink-muted) uppercase tracking-wider">
                Dr. Evelyn Reed • Chief University Librarian
              </p>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Outstanding Items Warning -->
      <div class="rounded-2xl border border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 p-5">
        <div class="flex items-start gap-3">
          <AlertCircle class="size-6 text-(--color-danger) shrink-0 mt-0.5" />
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-(--color-danger)">
              Clearance Pending: Active Loans or Outstanding Dues Found
            </h3>
            <p class="text-xs text-(--color-ink-secondary) leading-relaxed">
              University regulations require all borrowed physical volumes and materials to be returned to the circulation desk before a No-Dues Clearance Certificate can be issued for semester examinations or graduation.
            </p>

            <div class="mt-3 rounded-xl border border-(--color-line) bg-(--color-card) p-3">
              <div class="flex items-center justify-between text-xs font-bold">
                <span>Active Loans on Record:</span>
                <span class="text-(--color-danger)">{clearance.activeLoansCount} Books</span>
              </div>
              <div class="mt-1 flex items-center justify-between text-xs font-bold">
                <span>Pending Fines:</span>
                <span class="text-(--color-danger)">${clearance.outstandingFines.toFixed(2)}</span>
              </div>
            </div>

            <p class="text-[11px] text-(--color-ink-muted)">
              Please return your borrowed items via the "Active Loans" tab or visit the Central Library Circulation Counter.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)}>Close</Button>
    {#if clearance.isCleared}
      <Button onclick={printCertificate}>
        <Printer class="size-4" /> Print / Save Certificate
      </Button>
    {/if}
  {/snippet}
</Dialog>
