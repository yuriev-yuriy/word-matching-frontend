<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="$emit('close')"
    >
      <div class="max-h-[85vh] w-[90vw] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:w-full sm:max-w-2xl lg:max-w-3xl dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Import Preview</h3>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="$emit('close')"
            aria-label="Close import preview"
          >
            ✕
          </button>
        </div>

        <p v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {{ errorMessage }}
        </p>

        <div
          v-for="sheet in localSheets"
          :key="sheet.sheet_key"
          class="relative mb-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <button
            type="button"
            class="absolute right-3 top-3 text-zinc-400 transition hover:text-red-500"
            aria-label="Remove sheet from import"
            @click="removeSheet(sheet.sheet_key)"
          >
            ✕
          </button>

          <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ sheet.original_sheet_name }}</p>
          <p class="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Rows: {{ sheet.count }}</p>
          <div
            v-if="sheet.ignored_rows > 0"
            class="mb-3 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-600/50 dark:bg-amber-900/20 dark:text-amber-100"
          >
            <p>Sheet contains {{ sheet.total_rows }} words.</p>
            <p>Only the first {{ sheet.processed_rows }} will be imported.</p>
            <p>Last {{ sheet.ignored_rows }} rows will be ignored.</p>
          </div>

          <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">List name</label>
          <input
            v-model="listNames[sheet.sheet_key]"
            type="text"
            :class="[
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:bg-zinc-900 dark:text-zinc-100',
              isUniqueWordListName(listNames[sheet.sheet_key], sheet.sheet_key)
                ? 'mb-3 border-zinc-300 dark:border-zinc-700'
                : 'border-red-500 dark:border-red-500',
            ]"
          />
          <p
            v-if="!isUniqueWordListName(listNames[sheet.sheet_key], sheet.sheet_key)"
            class="mb-3 mt-1 text-xs text-red-600 dark:text-red-400"
          >
            List name has to be unique
          </p>

          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-xs">
              <thead>
                <tr class="text-zinc-500 dark:text-zinc-400">
                  <th class="px-2 py-1">Word</th>
                  <th class="px-2 py-1">Translation</th>
                  <th class="px-2 py-1">Hint</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in sheet.preview_rows"
                  :key="`${sheet.sheet_key}-${rowIndex}`"
                  class="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td class="px-2 py-1 text-zinc-800 dark:text-zinc-100">{{ row.word }}</td>
                  <td class="px-2 py-1 text-zinc-800 dark:text-zinc-100">{{ row.translation }}</td>
                  <td class="px-2 py-1 text-zinc-600 dark:text-zinc-300">{{ row.hint || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p v-if="localSheets.length === 0" class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          No sheets selected for import
        </p>

        <div class="mt-2 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isConfirmDisabled"
            @click="submitConfirm"
          >
            {{ loading ? 'Importing...' : 'Confirm import' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  fileToken: { type: String, default: '' },
  sheets: { type: Array, default: () => [] },
  existingLists: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
});

const emit = defineEmits(['close', 'confirm']);

const listNames = reactive({});
const localSheets = ref([]);

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const existingListNameSet = computed(() => {
  const names = props.existingLists.map((list) => {
    if (typeof list === 'string') return list;
    return list?.name || '';
  });
  return new Set(names.map(normalizeName).filter(Boolean));
});

watch(
  () => [props.open, props.sheets],
  () => {
    if (!props.open) return;
    localSheets.value = props.sheets.map((sheet) => ({ ...sheet }));
    Object.keys(listNames).forEach((key) => delete listNames[key]);
    localSheets.value.forEach((sheet) => {
      listNames[sheet.sheet_key] = sheet.original_sheet_name || '';
    });
  },
  { immediate: true, deep: true }
);

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});

const isUniqueWordListName = (name, sheetKey) => {
  const normalized = normalizeName(name);
  if (!normalized) return true;

  const hasDuplicateInImport = localSheets.value.some((sheet) => {
    if (sheet.sheet_key === sheetKey) return false;
    return normalizeName(listNames[sheet.sheet_key]) === normalized;
  });

  if (hasDuplicateInImport) return false;
  return !existingListNameSet.value.has(normalized);
};

const hasInvalidNames = computed(() =>
  localSheets.value.some((sheet) => !isUniqueWordListName(listNames[sheet.sheet_key], sheet.sheet_key))
);

const isConfirmDisabled = computed(() => props.loading || localSheets.value.length === 0 || hasInvalidNames.value);

const removeSheet = (sheetKey) => {
  localSheets.value = localSheets.value.filter((sheet) => sheet.sheet_key !== sheetKey);
  delete listNames[sheetKey];
};

const submitConfirm = () => {
  if (isConfirmDisabled.value) return;

  const lists = localSheets.value.map((sheet) => ({
    sheet_key: sheet.sheet_key,
    list_name: (listNames[sheet.sheet_key] || '').trim(),
  }));

  emit('confirm', {
    file_token: props.fileToken,
    lists,
  });
};
</script>
