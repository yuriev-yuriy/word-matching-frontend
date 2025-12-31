<template>
  <div
    class="rounded-2xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md dark:border-zinc-800/70 dark:bg-zinc-900/50 sm:p-6"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: "UiCard",
};
</script>
