<template>
  <div
    id="app"
    class="relative min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950 dark:text-zinc-100"
  >
    <div class="pointer-events-none absolute inset-x-0 top-0 h-64">
      <div class="mx-auto h-64 w-64 -translate-y-10 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/20" />
    </div>

    <header class="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <router-link
          to="/"
          :class="[
            'flex items-center gap-3 rounded-xl px-2 py-1 transition',
            $route.path === '/'
              ? 'pointer-events-none cursor-default'
              : 'hover:bg-violet-100/70 dark:hover:bg-violet-900/30'
          ]"
        >
          <div class="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-sm sm:flex">
            CM
          </div>
          <div class="text-left">
            <p class="text-lg font-semibold tracking-tight">ClickToMemo</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Smart matching practice</p>
          </div>
        </router-link>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-2xl hidden md:block">
          Learn faster with smart matching
        </h1>
        <div class="flex items-center gap-3">
          <UiButton
            v-if="!authState.isAuthenticated"
            variant="secondary"
            class="inline-flex"
            @click="$router.push('/login')"
          >
            Login
          </UiButton>
          <div v-else ref="userMenu" class="relative">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white/50 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/70"
              @click="toggleUserMenu"
            >
              <span class="max-w-32 truncate">{{ authState.user?.name }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4 transition"
                :class="isUserMenuOpen ? 'rotate-180' : ''"
                aria-hidden="true"
              >
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>

            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {{ authState.user?.name }}
              </p>
              <p class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {{ authState.user?.email }}
              </p>
              <div class="my-3 h-px bg-zinc-200 dark:bg-zinc-800"></div>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                @click="logout"
              >
                Logout
              </button>
            </div>
          </div>
          <UiButton variant="secondary" class="hidden sm:inline-flex">
            Try demo
          </UiButton>
          <ThemeToggle :inline="true" />
          <button
            v-if="!isSidebarOpen"
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 md:hidden"
            @click="toggleSidebar"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>

    <SidebarMenu
      :isOpen="isSidebarOpen"
      :files="files"
      :isLoggedIn="authState.isAuthenticated"
      @close="toggleSidebar"
      @fileLoaded="handleFileLoaded"
    />

    <button
      @click="toggleSidebar"
      :class="[
        'fixed top-26 left-6 px-4 py-2 rounded-xl inline-flex bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 z-40',
        authState.isAuthenticated ? 'lg:hidden' : '',
      ]"
    >
      Open Menu
    </button>

    <main class="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import ThemeToggle from "./components/ThemeToggle.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import UiButton from "./components/ui/Button.vue";
import { authState } from "./state/auth";
import api from "./services/api";

export default {
  name: "App",
  components: {
    ThemeToggle,
    SidebarMenu,
    UiButton,
  },
  data() {
    return {
      authState,
      isSidebarOpen: false,
      isUserMenuOpen: false,
      files: [],
    };
  },
  watch: {
    $route() {
      this.isUserMenuOpen = false;
    },
  },
  methods: {
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
    },
    handleDocumentClick(event) {
      if (!this.isUserMenuOpen) return;

      const menu = this.$refs.userMenu;
      if (menu && !menu.contains(event.target)) {
        this.isUserMenuOpen = false;
      }
    },
    async logout() {
      try {
        await api.post("/logout");
      } catch (e) {
        // optional: log silently
      }
      authState.user = null;
      authState.isAuthenticated = false;
      this.isUserMenuOpen = false;
      this.$router.push("/");
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleFileLoaded(fileData) {
      console.log("Loaded file data:", fileData);
    },
  },
  created() {
    this.files = [
      { id: 1, name: "Sample File 1.xlsx" },
      { id: 2, name: "Math Practice.xlsx" },
      { id: 3, name: "Definitions.xlsx" },
    ];
  },
  mounted() {
    document.addEventListener("click", this.handleDocumentClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
  },
};
</script>
