<script lang="ts">
  import { FlaskConical } from 'lucide-svelte';
  import { cn } from '../../utils/cn';

  /**
   * Says plainly that a screen is a mockup.
   *
   * Spec section 7, item 3 — "say what the software actually does" — is listed
   * as the highest-value item in the whole rebuild document. The Flutter app
   * advertised "1080p HD video calling with screen sharing and noise
   * cancellation" over a gradient box with a Timer, and "SwapBot AI 2.0" over an
   * if/contains chain. Neither has any backend here either, so neither claims to.
   */
  let { what, detail, class: className }: { what: string; detail: string; class?: string } =
    $props();
</script>

<div
  class={cn(
    'flex items-start gap-3 rounded-[var(--radius-button)] border-[1.2px] border-(--color-karma)/40 bg-(--color-karma)/10 px-4 py-3',
    className
  )}
  role="note"
>
  <FlaskConical class="mt-0.5 size-[18px] shrink-0 text-(--color-warning)" />
  <p class="text-[0.8125rem] leading-snug text-(--color-ink-secondary)">
    <strong class="font-bold text-(--color-ink)">{what} — UI prototype.</strong>
    {detail}
  </p>
</div>
