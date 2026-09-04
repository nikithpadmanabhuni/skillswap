<script lang="ts">
  import {
    ArrowLeft,
    Mic,
    MicOff,
    MonitorUp,
    PhoneOff,
    Video,
    VideoOff
  } from 'lucide-svelte';
  import { page } from '$app/state';
  import { Avatar, Button, Card } from '$shared/components/ui';
  import { PrototypeBanner } from '$shared/components/domain';
  import { CURRENT_USER_ID, currentUser, getProfile, sessions } from '$shared/mock';

  const session = $derived(sessions.find((s) => s.id === page.params.id));
  const peerId = $derived(
    session?.providerId === CURRENT_USER_ID ? session?.requesterId : session?.providerId
  );
  const peer = $derived(peerId ? getProfile(peerId) : undefined);

  // Local UI state only. There is no WebRTC, LiveKit or Agora here, and the
  // banner above says so — spec 3.2 and section 7 item 3. The Flutter screen
  // advertised "1080p HD with screen sharing and noise cancellation" over a
  // gradient box and a Timer; making that real is a 1-2 week LiveKit job.
  let muted = $state(false);
  let cameraOff = $state(false);
  let sharing = $state(false);
  let seconds = $state(0);

  $effect(() => {
    const t = setInterval(() => (seconds += 1), 1000);
    return () => clearInterval(t);
  });

  const elapsed = $derived(
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  );
</script>

<svelte:head><title>Video call (prototype) · SkillSwap Campus</title></svelte:head>

<a
  href="/sessions/{page.params.id}"
  class="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-(--color-ink-muted) hover:text-(--color-ink)"
>
  <ArrowLeft class="size-4" /> Session
</a>

<PrototypeBanner
  what="Video call"
  detail="This screen is layout only — there is no WebRTC, LiveKit or Agora connection behind it, and no audio or video is captured. The controls below toggle local state and nothing else."
  class="mb-4"
/>

{#if !session || !peer}
  <Card class="text-center"><p class="text-body-lg">That session does not exist.</p></Card>
{:else}
  <Card padded={false} class="overflow-hidden">
    <div class="relative grid aspect-video place-items-center bg-gradient-mesh">
      <div class="flex flex-col items-center gap-3 text-white">
        <Avatar name={peer.name} src={peer.avatarUrl} size={96} class="ring-4 ring-white/25" />
        <h1 class="text-title-lg">{peer.name}</h1>
        <p class="text-[0.8125rem] opacity-80">
          {cameraOff ? 'Camera would be off' : 'Camera would be on'} · {muted
            ? 'Muted'
            : 'Unmuted'}{sharing ? ' · Sharing screen' : ''}
        </p>
      </div>

      <span
        class="absolute top-4 left-4 rounded-full bg-black/45 px-3 py-1 text-[0.75rem] font-bold tabular-nums text-white"
      >
        {elapsed}
      </span>
      <span
        class="absolute top-4 right-4 rounded-full bg-black/45 px-3 py-1 text-[0.6875rem] font-bold tracking-wide text-white uppercase"
      >
        Prototype
      </span>

      <div
        class="absolute right-4 bottom-4 grid aspect-video w-28 place-items-center rounded-[var(--radius-button)] border border-white/25 bg-black/35 sm:w-40"
      >
        <Avatar name={currentUser.name} size={36} class="ring-2 ring-white/25" />
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2 p-4">
      <Button variant={muted ? 'danger' : 'secondary'} size="icon" onclick={() => (muted = !muted)}>
        {#if muted}<MicOff />{:else}<Mic />{/if}
        <span class="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
      </Button>
      <Button
        variant={cameraOff ? 'danger' : 'secondary'}
        size="icon"
        onclick={() => (cameraOff = !cameraOff)}
      >
        {#if cameraOff}<VideoOff />{:else}<Video />{/if}
        <span class="sr-only">{cameraOff ? 'Turn camera on' : 'Turn camera off'}</span>
      </Button>
      <Button
        variant={sharing ? 'primary' : 'secondary'}
        size="icon"
        onclick={() => (sharing = !sharing)}
      >
        <MonitorUp />
        <span class="sr-only">{sharing ? 'Stop sharing' : 'Share screen'}</span>
      </Button>
      <Button variant="danger" href="/sessions/{session.id}"><PhoneOff /> Leave</Button>
    </div>
  </Card>
{/if}
