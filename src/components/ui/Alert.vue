<template>
  <div
    v-bind="$attrs"
    :class="[
      'rounded-xl border px-4 py-3 text-sm shadow-sm',
      variantClasses[variant],
    ]"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: "UiAlert",
  props: {
    variant: {
      type: String,
      default: "warning",
    },
  },
  data() {
    return {
      variantClasses: {
        warning: "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-600/50 dark:bg-amber-900/20 dark:text-amber-100",
        info: "border-indigo-200/80 bg-indigo-50 text-indigo-900 dark:border-indigo-600/50 dark:bg-indigo-900/20 dark:text-indigo-100",
      },
    };
  },
};
</script>
