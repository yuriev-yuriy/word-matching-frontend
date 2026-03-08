<template>
  <div class="px-4 py-6 text-left">
    <div class="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div class="mb-3 flex justify-end">
        <button
          v-if="authState.isAuthenticated"
          type="button"
          class="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
          @click="openAddWordModal"
        >
          Add word
        </button>
      </div>

      <p v-if="previewError" class="mb-3 text-xs text-red-600 dark:text-red-400">
        {{ previewError }}
      </p>

      <div v-if="lists.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
        No word lists yet.
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="list in lists"
          :key="list.id"
          class="flex items-center justify-between rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <button
            type="button"
            class="truncate text-left text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
          >
            {{ list.name }}
          </button>

          <div class="ml-3 flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Edit list"
            >
              ✎
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              aria-label="Delete list"
              @click="deleteList(list.id)"
            >
              🗑
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <ImportPreviewModal
    :open="isPreviewModalOpen"
    :file-token="previewData?.file_token || ''"
    :sheets="previewData?.sheets || []"
    :existing-lists="lists"
    :loading="isConfirmLoading"
    :error-message="confirmError"
    @close="closePreviewModal"
    @confirm="confirmImport"
  />

  <AddWordModal
    :open="isAddWordModalOpen"
    :lists="lists"
    @close="closeAddWordModal"
    @saved="handleWordSaved"
  />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import api from '../services/api';
import { authState } from '../state/auth';
import AddWordModal from './AddWordModal.vue';
import ImportPreviewModal from './ImportPreviewModal.vue';

const props = defineProps({
  importRequest: {
    type: Object,
    default: null,
  },
});

const lists = ref([]);
const previewError = ref('');
const confirmError = ref('');
const isPreviewModalOpen = ref(false);
const isConfirmLoading = ref(false);
const previewData = ref(null);
const isAddWordModalOpen = ref(false);

const loadLists = async () => {
  const response = await api.get('/api/word-lists');
  lists.value = response.data;
};

const deleteList = async (id) => {
  const confirmed = window.confirm('Delete this word list?');
  if (!confirmed) return;

  await api.delete(`/api/word-lists/${id}`);
  await loadLists();
};

const formatError = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message && !data?.errors) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return first.message || fallback;
  }
  if (data?.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey][0]) {
      return data.errors[firstKey][0];
    }
  }
  return fallback;
};

const handleImportPreview = async (file) => {
  if (!file) return;

  previewError.value = '';
  confirmError.value = '';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/api/word-lists/import/preview', formData);
    previewData.value = response.data;
    isPreviewModalOpen.value = true;
  } catch (error) {
    if (error?.response?.status === 422) {
      previewError.value = formatError(error, 'Import preview failed.');
    } else {
      previewError.value = 'Import preview failed.';
    }
  }
};

const closePreviewModal = () => {
  isPreviewModalOpen.value = false;
  confirmError.value = '';
};

const openAddWordModal = () => {
  isAddWordModalOpen.value = true;
};

const closeAddWordModal = () => {
  isAddWordModalOpen.value = false;
};

const handleWordSaved = async ({ createdNewList }) => {
  if (createdNewList) {
    await loadLists();
  }
};

const confirmImport = async (payload) => {
  isConfirmLoading.value = true;
  confirmError.value = '';

  try {
    await api.post('/api/word-lists/import/confirm', payload);

    isPreviewModalOpen.value = false;
    previewData.value = null;
    await loadLists();
  } catch (error) {
    if (error?.response?.status === 422) {
      confirmError.value = formatError(error, 'Import confirm failed.');
    } else {
      confirmError.value = 'Import confirm failed.';
    }
  } finally {
    isConfirmLoading.value = false;
  }
};

onMounted(async () => {
  if (!authState.isAuthenticated) return;
  await loadLists();
});

watch(
  () => props.importRequest,
  async (request) => {
    if (!authState.isAuthenticated || !request?.file) return;
    await handleImportPreview(request.file);
  }
);
</script>
