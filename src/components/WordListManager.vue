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
      <p
        v-if="importSuccessMessage"
        class="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
      >
        {{ importSuccessMessage }}
      </p>

      <div v-if="wordListsState.loading" class="text-sm text-zinc-500 dark:text-zinc-400">
        Loading word lists...
      </div>

      <div v-else-if="wordListsState.lists.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
        No word lists yet.
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="list in wordListsState.lists"
          :key="list.id"
          :class="[
            'flex items-center justify-between rounded-lg border px-3 py-2 transition-colors duration-700',
            list.isNew
              ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/25'
              : 'border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/40',
          ]"
        >
          <button
            type="button"
            class="truncate text-left text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
            @click="startTrainingFromList(list)"
          >
            {{ list.name }}
          </button>

          <div class="ml-3 flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Edit list"
              @click="openEditListModal(list)"
            >
              ✎
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              aria-label="Delete list"
              @click="askDeleteList(list)"
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
    :existing-lists="wordListsState.lists"
    :loading="isConfirmLoading"
    :error-message="confirmError"
    @close="closePreviewModal"
    @confirm="confirmImport"
  />

  <AddWordModal
    :open="isAddWordModalOpen"
    :lists="wordListsState.lists"
    @close="closeAddWordModal"
    @saved="handleWordSaved"
  />

  <EditListModal
    :open="isEditListModalOpen"
    :list="activeList"
    @close="closeEditListModal"
    @renamed="handleListRenamed"
  />

  <Teleport to="body">
    <div
      v-if="isDeleteListModalOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      @click.self="cancelDeleteList"
    >
      <div class="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h4 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Delete word list "{{ listPendingDeletion?.name }}"?
        </h4>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          This action cannot be undone.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            :disabled="isDeletingList"
            @click="cancelDeleteList"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeletingList"
            @click="confirmDeleteList"
          >
            {{ isDeletingList ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import api from '../services/api';
import { authState } from '../state/auth';
import {
  addImportedLists,
  addWordList,
  clearNewFlags,
  ensureWordListsLoaded,
  removeWordList,
  renameWordList,
  wordListsState,
} from '../state/wordLists';
import AddWordModal from './AddWordModal.vue';
import EditListModal from './EditListModal.vue';
import ImportPreviewModal from './ImportPreviewModal.vue';

const props = defineProps({
  importRequest: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(['start-training']);

const previewError = ref('');
const confirmError = ref('');
const importSuccessMessage = ref('');
const isPreviewModalOpen = ref(false);
const isConfirmLoading = ref(false);
const previewData = ref(null);
const isAddWordModalOpen = ref(false);
const isEditListModalOpen = ref(false);
const activeList = ref(null);
const isDeleteListModalOpen = ref(false);
const listPendingDeletion = ref(null);
const isDeletingList = ref(false);
let importFeedbackTimeoutId = null;

const askDeleteList = (list) => {
  listPendingDeletion.value = list ? { id: list.id, name: list.name } : null;
  isDeleteListModalOpen.value = true;
};

const cancelDeleteList = () => {
  if (isDeletingList.value) return;
  listPendingDeletion.value = null;
  isDeleteListModalOpen.value = false;
};

const confirmDeleteList = async () => {
  const id = listPendingDeletion.value?.id;
  if (!id) return;

  isDeletingList.value = true;
  try {
    await api.delete(`/api/word-lists/${id}`);
    removeWordList(id);
    if (activeList.value?.id === id) {
      closeEditListModal();
    }
    listPendingDeletion.value = null;
    isDeleteListModalOpen.value = false;
  } finally {
    isDeletingList.value = false;
  }
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
  importSuccessMessage.value = '';

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

const openEditListModal = (list) => {
  activeList.value = list ? { id: list.id, name: list.name } : null;
  isEditListModalOpen.value = true;
};

const startTrainingFromList = (list) => {
  if (!list?.id) return;
  emit('start-training', list.id);
};

const closeEditListModal = () => {
  isEditListModalOpen.value = false;
  activeList.value = null;
};

const handleSessionExpired = () => {
  isPreviewModalOpen.value = false;
  isAddWordModalOpen.value = false;
  isEditListModalOpen.value = false;
  activeList.value = null;
};

const handleListRenamed = ({ id, name }) => {
  renameWordList(id, name);

  if (activeList.value?.id === id) {
    activeList.value = { ...activeList.value, name };
  }
};

const handleWordSaved = ({ createdList }) => {
  if (!createdList?.id) return;
  addWordList({
    id: createdList.id,
    name: createdList.name,
    words_count: createdList.words_count ?? 1,
  });
};

const confirmImport = async (payload) => {
  isConfirmLoading.value = true;
  confirmError.value = '';
  importSuccessMessage.value = '';

  try {
    const response = await api.post('/api/word-lists/import/confirm', payload);
    const createdLists = Array.isArray(response.data?.created_lists) ? response.data.created_lists : [];
    const addedIds = addImportedLists(createdLists);

    isPreviewModalOpen.value = false;
    previewData.value = null;
    if (createdLists.length === 1) {
      const list = createdLists[0];
      importSuccessMessage.value = `${list.words_created} words imported into '${list.name}'.`;
    } else if (createdLists.length > 1) {
      importSuccessMessage.value = `Import successful: ${createdLists.length} lists created.`;
    } else {
      importSuccessMessage.value = 'Words imported successfully.';
    }

    if (importFeedbackTimeoutId) {
      clearTimeout(importFeedbackTimeoutId);
    }
    importFeedbackTimeoutId = setTimeout(() => {
      importSuccessMessage.value = '';
      clearNewFlags(addedIds);
      importFeedbackTimeoutId = null;
    }, 3000);
  } catch (error) {
    confirmError.value = 'Oops, something went wrong. Please try again.';
  } finally {
    isConfirmLoading.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('app:session-expired', handleSessionExpired);
  if (!authState.isAuthenticated) return;
  await ensureWordListsLoaded();
});

onBeforeUnmount(() => {
  window.removeEventListener('app:session-expired', handleSessionExpired);
  if (importFeedbackTimeoutId) {
    clearTimeout(importFeedbackTimeoutId);
  }
});

watch(
  () => props.importRequest,
  async (request) => {
    if (!authState.isAuthenticated || !request?.file) return;
    await handleImportPreview(request.file);
  }
);
</script>
