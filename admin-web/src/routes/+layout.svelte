<script lang="ts">
  import '../app.css';
  import { Toast } from '$shared/components/ui';
  import { theme } from '$shared/theme.svelte';

  let { children } = $props();
  $effect(() => theme.init());
</script>

<svelte:head>
  <title>SkillSwap Admin</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<a href="#main" class="skip-link">Skip to content</a>
{@render children()}
<Toast />
