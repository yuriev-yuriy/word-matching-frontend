<template>
  <button
    v-bind="$attrs"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "UiButton",
  props: {
    variant: {
      type: String,
      default: "primary",
    },
    size: {
      type: String,
      default: "md",
    },
  },
  data() {
    return {
      variantClasses: {
        primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110",
        secondary: "border border-zinc-300 bg-white/50 text-zinc-900 hover:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/70",
        ghost: "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60",
      },
      sizeClasses: {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-3 text-base",
      },
    };
  },
};
</script>
