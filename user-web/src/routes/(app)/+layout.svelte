<script lang="ts">
  import { page } from '$app/state';
  import {
    Bell,
    Compass,
    LogOut,
    MessageSquare,
    Settings,
    Trophy,
    Triangle,
    User,
    CalendarDays,
    Gift,
    Wallet,
    Bot
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Avatar } from '$shared/components/ui';
  import { KarmaBadge } from '$shared/components/domain';
  import { currentUser, unreadCount } from '$shared/mock';
  import { session } from '$lib/session.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  let { children } = $props();

  // Primary destinations appear in the mobile bottom bar; the rest are sidebar-only.
  const nav = [
    { href: '/explore', label: 'Explore', icon: Compass, primary: true },
    { href: '/sessions', label: 'Sessions', icon: CalendarDays, primary: true },
    { href: '/mesh', label: 'Mesh', icon: Triangle, primary: true },
    { href: '/messages', label: 'Messages', icon: MessageSquare, primary: true },
    { href: '/profile', label: 'Profile', icon: User, primary: true },
    { href: '/karma', label: 'Karma wallet', icon: Wallet, primary: false },
    { href: '/perks', label: 'Perks', icon: Gift, primary: false },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, primary: false },
    { href: '/assistant', label: 'Assistant', icon: Bot, primary: false },
    { href: '/notifications', label: 'Notifications', icon: Bell, primary: false },
    { href: '/settings', label: 'Settings', icon: Settings, primary: false }
  ];

  const primary = nav.filter((n) => n.primary);

  const isActive = (href: string) =>
    page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

  function signOut() {
    session.signOut();
    goto('/');
  }
</script>

<div class="min-h-dvh">
  <!-- Desktop sidebar. The 768px switch matches main_navigation.dart. -->
  <aside
    class="fixed inset-y-0 left-0 hidden w-60 flex-col border-r-[1.2px] border-(--color-line) bg-(--color-card) md:flex"
  >
    <a href="/explore" class="flex items-center gap-2.5 px-5 py-5">
      <span class="grid size-8 place-items-center rounded-[10px] bg-gradient-brand text-white">
        <Triangle class="size-4" />
      </span>
      <span class="text-title-md text-(--color-ink)">SkillSwap</span>
    </a>

    <nav class="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
      <ul class="flex flex-col gap-0.5">
        {#each nav as item (item.href)}
          {@const Icon = item.icon}
          <li>
            <a
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              class="flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-[0.875rem] font-semibold transition-colors {isActive(
                item.href
              )
                ? 'bg-(--color-nav-indicator) font-extrabold text-(--color-primary)'
                : 'text-(--color-ink-secondary) hover:bg-(--color-elevated)'}"
            >
              <Icon class="size-[18px] shrink-0" />
              <span class="truncate">{item.label}</span>
              {#if item.href === '/notifications' && unreadCount > 0}
                <span
                  class="ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-(--color-danger) text-[0.625rem] font-bold text-white"
                >
                  {unreadCount}
                </span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="border-t-[1.2px] border-(--color-line) p-3">
      <a
        href="/profile"
        class="flex items-center gap-2.5 rounded-[var(--radius-button)] p-2 hover:bg-(--color-elevated)"
      >
        <Avatar name={currentUser.name} src={currentUser.avatarUrl} size={34} />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[0.8125rem] font-bold text-(--color-ink)">
            {currentUser.name}
          </span>
          <span class="block truncate text-[0.6875rem] text-(--color-ink-muted)">
            {currentUser.major}
          </span>
        </span>
      </a>
      <button
        type="button"
        onclick={signOut}
        class="mt-1 flex w-full items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-[0.8125rem] font-semibold text-(--color-ink-muted) transition-colors hover:bg-(--color-elevated) hover:text-(--color-danger)"
      >
        <LogOut class="size-4" /> Sign out
      </button>
    </div>
  </aside>

  <div class="md:pl-60">
    <!-- Top bar: karma balance is always visible, because everything costs it. -->
    <header
      class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[1.2px] border-(--color-line) bg-(--color-card)/95 px-4 py-3 backdrop-blur sm:px-6"
    >
      <a href="/explore" class="flex items-center gap-2 md:hidden">
        <span class="grid size-7 place-items-center rounded-lg bg-gradient-brand text-white">
          <Triangle class="size-3.5" />
        </span>
        <span class="text-title-sm text-(--color-ink)">SkillSwap</span>
      </a>
      <div class="hidden md:block"></div>

      <div class="flex items-center gap-2">
        <a href="/karma" aria-label="Karma wallet, {currentUser.karmaBalance} Karma">
          <KarmaBadge amount={currentUser.karmaBalance} size="sm" />
        </a>
        <a
          href="/notifications"
          class="relative grid size-9 place-items-center rounded-full text-(--color-ink-secondary) hover:bg-(--color-elevated) md:hidden"
          aria-label="Notifications{unreadCount ? `, ${unreadCount} unread` : ''}"
        >
          <Bell class="size-[18px]" />
          {#if unreadCount > 0}
            <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-(--color-danger)"></span>
          {/if}
        </a>
        <ThemeSwitcher />
      </div>
    </header>

    <!-- pb-20 clears the mobile bottom bar; content clamps at 1280px. -->
    <main id="main" class="mx-auto max-w-[var(--container-app)] px-4 pt-5 pb-24 sm:px-6 md:pb-10">
      {@render children()}
    </main>
  </div>

  <nav
    class="fixed inset-x-0 bottom-0 z-30 flex border-t-[1.2px] border-(--color-line) bg-(--color-card) md:hidden"
    aria-label="Main"
  >
    {#each primary as item (item.href)}
      {@const Icon = item.icon}
      <a
        href={item.href}
        aria-current={isActive(item.href) ? 'page' : undefined}
        class="flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-bold transition-colors {isActive(
          item.href
        )
          ? 'text-(--color-primary)'
          : 'text-(--color-ink-muted)'}"
      >
        <span
          class="rounded-full px-4 py-1 transition-colors {isActive(item.href)
            ? 'bg-(--color-nav-indicator)'
            : ''}"
        >
          <Icon class="size-[18px]" />
        </span>
        {item.label}
      </a>
    {/each}
  </nav>
</div>
