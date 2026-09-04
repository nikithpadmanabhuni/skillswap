<script lang="ts">
  import '../app.css';
  import { Toast } from '$shared/components/ui';
  import { theme } from '$shared/theme.svelte';
  import { session } from '$lib/session.svelte';

  let { children } = $props();

  // The blocking script in app.html already painted the right theme; this syncs
  // the store to it so the switcher starts from the correct value.
  $effect(() => {
    theme.init();
    session.init();
  });
</script>

<svelte:head>
  <title>SkillSwap Campus</title>
  <meta
    name="description"
    content="Trade what you know for what you want to learn. A peer-to-peer skill exchange for students, settled in Karma."
  />
</svelte:head>

<a href="#main" class="skip-link">Skip to content</a>
{@render children()}
<Toast />
