<template>
  <button
    @click="toggleTheme"
    class="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white/50 p-2 text-zinc-900 transition hover:bg-violet-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-violet-900/30 dark:focus-visible:ring-offset-zinc-950"
    :class="[
      inline ? '' : 'absolute top-4 right-4',
    ]"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    type="button"
  >
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10-5a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM5 12a1 1 0 01-1 1H2a1 1 0 110-2h2a1 1 0 011 1zm12.95 6.536a1 1 0 01-1.414 1.414l-1.414-1.414a1 1 0 011.414-1.414l1.414 1.414zM8.878 8.878a1 1 0 01-1.414 0L6.05 7.464A1 1 0 017.464 6.05l1.414 1.414a1 1 0 010 1.414zm9.072-2.828a1 1 0 010 1.414L16.536 8.88a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM8.878 15.122a1 1 0 010 1.414L7.464 17.95a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM12 7a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
  
<script>
export default {
  name: 'ThemeToggle',
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDark: false,
    };
  },
  mounted() {
    try {
      const storedTheme = localStorage.getItem('wm_theme');
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        this.isDark = true;
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        this.isDark = false;
      }
    } catch {
      // Ignore storage errors.
    }
  },
  methods: {
    toggleTheme() {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        this.isDark = false;
        try {
          localStorage.setItem('wm_theme', 'light');
        } catch {
          // Ignore storage errors.
        }
      } else {
        html.classList.add('dark');
        this.isDark = true;
        try {
          localStorage.setItem('wm_theme', 'dark');
        } catch {
          // Ignore storage errors.
        }
      }
    },
  },
};
</script>
  
