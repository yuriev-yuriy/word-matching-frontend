<template>
  <div class="h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800/70">
    <div
      class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-700 ease-out"
      :style="{ width: `${value}%` }"
    />
  </div>
</template>

<script>
export default {
  name: "UiProgressBar",
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
};
</script>
