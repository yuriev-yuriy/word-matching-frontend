<template>
    <button
      @click="toggleTheme"
      class="absolute top-4 right-4 px-4 py-2 rounded-lg text-sm transition duration-300"
      :class="{
        'bg-gray-800 text-white hover:bg-gray-700': isDark,
        'bg-gray-200 text-gray-800 hover:bg-gray-300': !isDark,
      }"
    >
      {{ isDark ? 'Light' : 'Dark' }}
    </button>
  </template>
  
  <script>
  export default {
    name: 'ThemeToggle',
    data() {
        return {
            isDark: false,
        };
    },
    methods: {
      toggleTheme() {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
          html.classList.remove('dark');
          this.isDark = false;
        } else {
          html.classList.add('dark');
          this.isDark = true;
        }
      },
    },
  };
  </script>
  