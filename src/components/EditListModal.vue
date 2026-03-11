<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="$emit('close')"
    >
      <div class="max-h-[85vh] w-[95vw] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:w-full sm:max-w-5xl dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Edit list</h3>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="$emit('close')"
            aria-label="Close edit list modal"
          >
            ✕
          </button>
        </div>

        <p v-if="modalError" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {{ modalError }}
        </p>

        <div class="mb-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">List name: {{ listTitle }}</p>
          <div class="flex flex-wrap items-start gap-2">
            <input
              v-model="renameName"
              type="text"
              class="min-w-[14rem] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isRenameLoading"
              @click="saveRename"
            >
              {{ isRenameLoading ? 'Saving...' : 'Save rename' }}
            </button>
          </div>
          <p v-if="renameError" class="mt-2 text-xs text-red-600 dark:text-red-400">{{ renameError }}</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                <th class="px-2 py-2">Word</th>
                <th class="px-2 py-2">Translation</th>
                <th class="px-2 py-2">Rule</th>
                <th class="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingWords" class="border-b border-zinc-200 dark:border-zinc-800">
                <td colspan="4" class="px-2 py-6">
                  <div class="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-400" />
                    Loading words...
                  </div>
                </td>
              </tr>
              <tr
                v-else
                v-for="word in words"
                :key="word.id"
                class="border-b border-zinc-200 align-top dark:border-zinc-800"
              >
                <td class="px-2 py-2">
                  <input
                    v-if="editingWordId === word.id"
                    :ref="(el) => setWordInputRef(el, word.id)"
                    v-model="editDraft.word"
                    type="text"
                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    @keydown.enter.prevent="saveWord"
                    @keydown.esc.prevent="cancelEdit"
                  />
                  <p
                    v-if="editingWordId === word.id && editWordError"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ editWordError }}
                  </p>
                  <span v-else class="text-zinc-900 dark:text-zinc-100">{{ word.word }}</span>
                </td>
                <td class="px-2 py-2">
                  <input
                    v-if="editingWordId === word.id"
                    v-model="editDraft.translation"
                    type="text"
                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    @keydown.enter.prevent="saveWord"
                    @keydown.esc.prevent="cancelEdit"
                  />
                  <p
                    v-if="editingWordId === word.id && editTranslationError"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ editTranslationError }}
                  </p>
                  <span v-else class="text-zinc-900 dark:text-zinc-100">{{ word.translation }}</span>
                </td>
                <td class="px-2 py-2">
                  <input
                    v-if="editingWordId === word.id"
                    v-model="editDraft.hint"
                    type="text"
                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    @keydown.enter.prevent="saveWord"
                    @keydown.esc.prevent="cancelEdit"
                  />
                  <span v-else class="text-zinc-700 dark:text-zinc-300">{{ word.hint || '—' }}</span>
                </td>
                <td class="px-2 py-2">
                  <div class="flex items-center gap-2">
                    <template v-if="editingWordId === word.id">
                      <button
                        type="button"
                        class="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                        :disabled="isWordSaving || isEditInvalid"
                        @click="saveWord"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        class="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        @click="cancelEdit"
                      >
                        Cancel
                      </button>
                    </template>
                    <template v-else>
                      <button
                        type="button"
                        class="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        @click="startEdit(word)"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                        :disabled="isDeletingWord"
                        @click="deleteWord(word.id)"
                      >
                        Delete
                      </button>
                    </template>
                  </div>
                  <p v-if="wordErrorById[word.id]" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ wordErrorById[word.id] }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="!isLoadingWords && words.length === 0" class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          No words in this list.
        </p>
      </div>
    </div>

    <div
      v-if="isDeleteConfirmOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      @click.self="closeDeleteConfirm"
    >
      <div class="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h4 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Delete word?</h4>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          This action cannot be undone.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            :disabled="isDeletingWord"
            @click="closeDeleteConfirm"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeletingWord"
            @click="confirmDeleteWord"
          >
            {{ isDeletingWord ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const props = defineProps({
  open: { type: Boolean, default: false },
  list: { type: Object, default: null },
});

const emit = defineEmits(['close', 'renamed']);

const router = useRouter();
const words = ref([]);
const listTitle = ref('');
const renameName = ref('');
const renameError = ref('');
const modalError = ref('');
const isLoadingWords = ref(false);
const isRenameLoading = ref(false);
const isWordSaving = ref(false);
const isDeletingWord = ref(false);
const editingWordId = ref(null);
const isDeleteConfirmOpen = ref(false);
const pendingDeleteWordId = ref(null);
const currentListId = ref(null);

const editDraft = reactive({
  id: null,
  word: '',
  translation: '',
  hint: '',
});

const wordErrorById = reactive({});
const wordInputRefs = ref({});

const editWordError = computed(() => (editDraft.word.trim() ? '' : 'Word cannot be empty.'));
const editTranslationError = computed(() => (editDraft.translation.trim() ? '' : 'Translation cannot be empty.'));
const isEditInvalid = computed(() => !!editWordError.value || !!editTranslationError.value);

const clearWordErrors = () => {
  Object.keys(wordErrorById).forEach((key) => {
    delete wordErrorById[key];
  });
};

const redirectIfUnauthorized = (error) => {
  if (error?.response?.status !== 401) return false;
  router.push('/login');
  return true;
};

const extractMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (data?.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey][0]) {
      return data.errors[firstKey][0];
    }
  }
  return fallback;
};

const loadWords = async () => {
  const listId = props.list?.id;
  if (!listId) return;
  if (currentListId.value === listId) return;

  isLoadingWords.value = true;
  words.value = [];
  modalError.value = '';
  clearWordErrors();
  editingWordId.value = null;

  try {
    const response = await api.get(`/api/word-lists/${listId}/words`);
    words.value = Array.isArray(response.data) ? response.data : [];
    currentListId.value = listId;
  } catch (error) {
    if (redirectIfUnauthorized(error)) return;
    modalError.value = extractMessage(error, 'Unable to load words.');
  } finally {
    isLoadingWords.value = false;
  }
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      isDeleteConfirmOpen.value = false;
      pendingDeleteWordId.value = null;
      isDeletingWord.value = false;
      return;
    }
    listTitle.value = props.list?.name || '';
    renameName.value = props.list?.name || '';
    renameError.value = '';
    modalError.value = '';
    await loadWords();
  }
);

const saveRename = async () => {
  if (!props.list?.id) return;
  renameError.value = '';
  modalError.value = '';
  isRenameLoading.value = true;

  try {
    const response = await api.patch(`/api/word-lists/${props.list.id}`, {
      name: renameName.value,
    });

    listTitle.value = response.data?.name || renameName.value;
    renameName.value = listTitle.value;
    emit('renamed', { id: props.list.id, name: listTitle.value });
  } catch (error) {
    if (redirectIfUnauthorized(error)) return;
    if (error?.response?.status === 422) {
      renameError.value = extractMessage(error, 'Validation failed.');
    } else {
      modalError.value = extractMessage(error, 'Unable to rename list.');
    }
  } finally {
    isRenameLoading.value = false;
  }
};

const setWordInputRef = (el, id) => {
  if (!id) return;
  if (el) {
    wordInputRefs.value[id] = el;
  } else {
    delete wordInputRefs.value[id];
  }
};

const startEdit = async (word) => {
  editingWordId.value = word.id;
  editDraft.id = word.id;
  editDraft.word = word.word;
  editDraft.translation = word.translation;
  editDraft.hint = word.hint || '';
  delete wordErrorById[word.id];

  await nextTick();
  wordInputRefs.value[word.id]?.focus();
};

const cancelEdit = () => {
  editingWordId.value = null;
  editDraft.id = null;
  editDraft.word = '';
  editDraft.translation = '';
  editDraft.hint = '';
};

const saveWord = async () => {
  const rowId = editDraft.id;
  if (!rowId || editingWordId.value !== rowId) return;
  if (isEditInvalid.value) return;

  isWordSaving.value = true;
  modalError.value = '';
  delete wordErrorById[rowId];

  try {
    const response = await api.patch(`/api/words/${rowId}`, {
      word: editDraft.word,
      translation: editDraft.translation,
      hint: editDraft.hint,
    });

    const updated = response.data || {};
    const index = words.value.findIndex((item) => item.id === rowId);
    if (index !== -1) {
      words.value[index] = {
        ...words.value[index],
        word: updated.word ?? editDraft.word,
        translation: updated.translation ?? editDraft.translation,
        hint: updated.hint ?? editDraft.hint,
      };
    }

    cancelEdit();
  } catch (error) {
    if (redirectIfUnauthorized(error)) return;
    if (error?.response?.status === 422) {
      wordErrorById[rowId] = extractMessage(error, 'Validation failed.');
    } else {
      wordErrorById[rowId] = extractMessage(error, 'Unable to update word.');
    }
  } finally {
    isWordSaving.value = false;
  }
};

const deleteWord = (wordId) => {
  pendingDeleteWordId.value = wordId;
  isDeleteConfirmOpen.value = true;
};

const closeDeleteConfirm = () => {
  if (isDeletingWord.value) return;
  isDeleteConfirmOpen.value = false;
  pendingDeleteWordId.value = null;
};

const confirmDeleteWord = async () => {
  const wordId = pendingDeleteWordId.value;
  if (!wordId) return;

  modalError.value = '';
  delete wordErrorById[wordId];
  isDeletingWord.value = true;

  try {
    await api.delete(`/api/words/${wordId}`);
    const index = words.value.findIndex((w) => w.id === wordId);
    if (index !== -1) {
      words.value.splice(index, 1);
    }
    if (editingWordId.value === wordId) {
      cancelEdit();
    }
    isDeletingWord.value = false;
    closeDeleteConfirm();
  } catch (error) {
    if (redirectIfUnauthorized(error)) return;
    wordErrorById[wordId] = extractMessage(error, 'Unable to delete word.');
  } finally {
    isDeletingWord.value = false;
  }
};
</script>
