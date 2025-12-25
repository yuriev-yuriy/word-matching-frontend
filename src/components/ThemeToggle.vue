  <template>
    <button
      @click="toggleTheme"
      class="px-4 py-2 rounded-lg text-sm transition duration-300"
      :class="[
        inline ? '' : 'absolute top-4 right-4',
        isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      ]"
    >
      {{ isDark ? 'Light' : 'Dark' }}
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
  
