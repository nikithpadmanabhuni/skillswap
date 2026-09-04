<script lang="ts" module>
  import type { BadgeTone } from '../ui/Badge.svelte';
  import type { SessionStatus } from '../../types';

  export const STATUS_TONES: Record<SessionStatus, BadgeTone> = {
    pending: 'karma',
    accepted: 'ocean',
    scheduled: 'brand',
    completed: 'violet',
    reviewed: 'emerald',
    declined: 'danger'
  };
</script>

<script lang="ts">
  import { STATUS_LABELS } from '../../types';
  import Badge from '../ui/Badge.svelte';

  let { status, size = 'md' }: { status: SessionStatus; size?: 'sm' | 'md' } = $props();
</script>

<Badge tone={STATUS_TONES[status]} {size}>{STATUS_LABELS[status]}</Badge>
