<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import {
    CalendarDays,
    Gift,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldAlert,
    ShieldCheck,
    Ticket,
    Trophy,
    Users,
    Wallet,
    Settings as SettingsIcon
  } from 'lucide-svelte';
  import { Avatar, Sheet } from '$shared/components/ui';
  import { openReports, totals } from '$shared/mock';
  import { admin } from '$lib/session.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  let { children } = $props();
  let navOpen = $state(false);

  const nav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users, count: totals.users },
    { href: '/moderation', label: 'Moderation', icon: ShieldAlert, count: openReports.length, urgent: true },
    { href: '/sessions', label: 'Sessions', icon: CalendarDays },
    { href: '/karma', label: 'Karma ledger', icon: Wallet },
    { href: '/perks', label: 'Perks', icon: Gift },
    { href: '/redemptions', label: 'Redemptions', icon: Ticket },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: SettingsIcon }
  ];

  const isActive = (href: string) =>
    href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

  function signOut() {
    admin.signOut();
    goto('/login');
  }
</script>

{#snippet navList()}
  <ul class="flex flex-col gap-0.5">
    {#each nav as item (item.href)}
      {@const Icon = item.icon}
      <li>
        <a
          href={item.href}
          onclick={() => (navOpen = false)}
          aria-current={isActive(item.href) ? 'page' : undefined}
          class="flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-[0.875rem] font-semibold transition-colors {isActive(
            item.href
          )
            ? 'bg-(--color-nav-indicator) font-extrabold text-(--color-primary)'
            : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
        >
          <Icon class="size-[18px] shrink-0" />
          <span class="flex-1 truncate">{item.label}</span>
          {#if item.count}
            <span
              class="grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[0.625rem] font-bold {item.urgent
                ? 'bg-(--color-danger) text-white'
                : 'bg-(--color-elevated) text-(--color-ink-muted)'}"
            >
              {item.count}
            </span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
{/snippet}

<div class="min-h-dvh">
  <!-- Persistent sidebar: an admin panel is a desktop tool, so unlike the
       student app there is no bottom bar, just a drawer below the breakpoint. -->
  <aside
    class="fixed inset-y-0 left-0 hidden w-60 flex-col border-r-[1.2px] border-(--color-line) bg-(--color-card) lg:flex"
  >
    <a href="/" class="flex items-center gap-2.5 px-5 py-5">
      <span class="grid size-8 place-items-center rounded-[10px] bg-(--color-ink) text-(--color-card)">
        <ShieldCheck class="size-4" />
      </span>
      <span class="text-title-md text-(--color-ink)">Admin</span>
    </a>
    <nav class="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin sections">
      {@render navList()}
    </nav>
    <div class="border-t-[1.2px] border-(--color-line) p-3">
      <div class="flex items-center gap-2.5 p-2">
        <Avatar name={admin.name} size={34} />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[0.8125rem] font-bold text-(--color-ink)">{admin.name}</span>
          <span class="block truncate text-[0.6875rem] text-(--color-ink-muted)">{admin.role}</span>
        </span>
      </div>
      <button
        type="button"
        onclick={signOut}
        class="mt-1 flex w-full items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-[0.8125rem] font-semibold text-(--color-ink-muted) transition-colors hover:bg-(--color-elevated) hover:text-(--color-danger)"
      >
        <LogOut class="size-4" /> Sign out
      </button>
    </div>
  </aside>

  <div class="lg:pl-60">
    <header
      class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[1.2px] border-(--color-line) bg-(--color-card)/95 px-4 py-3 backdrop-blur sm:px-6"
    >
      <button
        type="button"
        onclick={() => (navOpen = true)}
        class="grid size-9 place-items-center rounded-[var(--radius-button)] text-(--color-ink-secondary) hover:bg-(--color-elevated) lg:hidden"
        aria-label="Open navigation"
      >
        <Menu class="size-[18px]" />
      </button>
      <span class="text-title-sm text-(--color-ink) lg:hidden">SkillSwap Admin</span>
      <div class="hidden lg:block"></div>
      <ThemeSwitcher />
    </header>

    <main id="main" class="mx-auto max-w-[1400px] px-4 pt-5 pb-12 sm:px-6">
      {@render children()}
    </main>
  </div>

  <Sheet bind:open={navOpen} title="Navigation" side="left">
    {@render navList()}
  </Sheet>
</div>
