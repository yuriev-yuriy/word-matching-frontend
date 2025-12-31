<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-11/12 max-w-md rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-xl dark:border-zinc-800/60 dark:bg-zinc-900"
      role="dialog"
      aria-modal="true"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "UiModal",
  emits: ["close"],
};
</script>
