<script lang="ts">
  import { cn } from '../../utils/cn';
  let { class: className }: { class?: string } = $props();
</script>

<!-- animate-pulse is disabled automatically by the global prefers-reduced-motion rule -->
<div class={cn('animate-pulse rounded-[var(--radius-chip)] bg-(--color-elevated)', className)}></div>
