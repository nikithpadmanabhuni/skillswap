<script lang="ts">
  import { ArrowRight, GraduationCap, Sparkles } from 'lucide-svelte';
  import type { PublicProfile, SwapMatch } from '../../types';
  import Avatar from '../ui/Avatar.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import MatchScoreBadge from './MatchScoreBadge.svelte';
  import RatingStars from './RatingStars.svelte';
  import SkillChip from './SkillChip.svelte';

  let { match, peer }: { match: SwapMatch; peer: PublicProfile } = $props();
</script>

<Card class="flex h-full flex-col gap-4">
  <div class="flex items-start gap-3">
    <Avatar name={peer.name} src={peer.avatarUrl} size={44} />
    <div class="min-w-0 flex-1">
      <a href="/u/{peer.id}" class="block truncate text-title-md text-(--color-ink) hover:underline">
        {peer.name}
      </a>
      <p class="truncate text-body-md text-(--color-ink-muted)">
        {peer.major} · {peer.campus}
      </p>
    </div>
    <MatchScoreBadge score={match.matchPercentage} isMutual={match.isMutual} />
  </div>

  <!-- The human-readable reasoning string. Spec 3.1: one per card. -->
  <p class="text-body-md leading-[1.45] text-(--color-ink-secondary)">{match.reasoning}</p>

  <div class="flex flex-wrap items-center gap-2">
    <span class="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-(--color-ink-muted)">
      <GraduationCap class="size-3.5" />
      {match.isMutual ? 'They teach' : 'Skill'}
    </span>
    <SkillChip skill={match.matchedOfferSkill} />
    {#if match.matchedWantSkill}
      <Sparkles class="size-3.5 text-(--color-ink-muted)" />
      <span class="text-[0.75rem] font-bold text-(--color-ink-muted)">You teach</span>
      <SkillChip skill={match.matchedWantSkill} />
    {/if}
  </div>

  <div class="mt-auto flex items-center justify-between gap-3 border-t-[1.2px] border-(--color-line) pt-3">
    <RatingStars rating={peer.rating} count={peer.reviewCount} />
    <Button href="/u/{peer.id}/propose" size="sm">
      Propose swap <ArrowRight />
    </Button>
  </div>
</Card>
