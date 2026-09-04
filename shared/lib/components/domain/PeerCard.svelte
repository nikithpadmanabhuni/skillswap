<script lang="ts">
  import { MapPin } from 'lucide-svelte';
  import type { PublicProfile } from '../../types';
  import Avatar from '../ui/Avatar.svelte';
  import Card from '../ui/Card.svelte';
  import KarmaBadge from './KarmaBadge.svelte';
  import RatingStars from './RatingStars.svelte';
  import SkillChip from './SkillChip.svelte';

  let { peer, href }: { peer: PublicProfile; href?: string } = $props();
</script>

<Card interactive class="flex flex-col gap-3">
  <div class="flex items-start gap-3">
    <Avatar name={peer.name} src={peer.avatarUrl} size={48} />
    <div class="min-w-0 flex-1">
      <h3 class="truncate text-title-md text-(--color-ink)">
        {#if href}
          <a {href} class="after:absolute after:inset-0 hover:underline">{peer.name}</a>
        {:else}{peer.name}{/if}
      </h3>
      <p class="truncate text-body-md text-(--color-ink-muted)">{peer.major}</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <RatingStars rating={peer.rating} count={peer.reviewCount} />
        <span class="inline-flex items-center gap-1 text-[0.75rem] text-(--color-ink-muted)">
          <MapPin class="size-3" />{peer.campus}
        </span>
      </div>
    </div>
    <KarmaBadge amount={peer.karmaBalance} size="sm" glow={false} />
  </div>

  {#if peer.skillsOffered.length}
    <div class="flex flex-wrap gap-1.5">
      {#each peer.skillsOffered.slice(0, 3) as skill (skill.id)}
        <SkillChip {skill} showLevel={false} />
      {/each}
      {#if peer.skillsOffered.length > 3}
        <span class="self-center text-[0.75rem] text-(--color-ink-muted)">
          +{peer.skillsOffered.length - 3} more
        </span>
      {/if}
    </div>
  {/if}
</Card>
