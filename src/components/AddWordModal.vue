<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add word</h3>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="$emit('close')"
            aria-label="Close add word modal"
          >
            ✕
          </button>
        </div>

        <p v-if="generalError" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {{ generalError }}
        </p>

        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Select list</label>
            <select
              v-model="selectedList"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="new">Create new list</option>
              <option v-for="list in lists" :key="list.id" :value="String(list.id)">
                {{ list.name }}
              </option>
            </select>
          </div>

          <div v-if="isCreatingNewList">
            <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">New list name</label>
            <input
              v-model="form.newListName"
              type="text"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <p v-if="fieldErrors.new_list_name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.new_list_name }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Word</label>
            <input
              ref="wordInputRef"
              v-model="form.word"
              type="text"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              @keydown.enter.prevent="focusTranslation"
            />
            <p v-if="fieldErrors.word" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.word }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Translation</label>
            <input
              ref="translationInputRef"
              v-model="form.translation"
              type="text"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              @keydown.enter.prevent="focusRule"
            />
            <p v-if="fieldErrors.translation" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.translation }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">Rule</label>
            <input
              ref="ruleInputRef"
              v-model="form.rule"
              type="text"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              @keydown.enter.prevent="submit"
            />
            <p v-if="fieldErrors.rule" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.rule }}</p>
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
            @click="submit"
          >
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  open: { type: Boolean, default: false },
  lists: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'saved']);

const loading = ref(false);
const generalError = ref('');
const selectedList = ref('new');
const lastSelectedList = ref(null);

const form = reactive({
  word: '',
  translation: '',
  rule: '',
  newListName: '',
});

const fieldErrors = reactive({
  word: '',
  translation: '',
  rule: '',
  new_list_name: '',
});

const wordInputRef = ref(null);
const translationInputRef = ref(null);
const ruleInputRef = ref(null);

const isCreatingNewList = computed(() => selectedList.value === 'new');

const clearErrors = () => {
  generalError.value = '';
  fieldErrors.word = '';
  fieldErrors.translation = '';
  fieldErrors.rule = '';
  fieldErrors.new_list_name = '';
};

const setInitialSelectedList = () => {
  if (lastSelectedList.value !== null) {
    if (lastSelectedList.value === 'new') {
      selectedList.value = 'new';
      return;
    }

    const stillExists = props.lists.some((list) => String(list.id) === String(lastSelectedList.value));
    if (stillExists) {
      selectedList.value = String(lastSelectedList.value);
      return;
    }
  }

  selectedList.value = props.lists.length > 0 ? String(props.lists[0].id) : 'new';
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;

    clearErrors();
    form.word = '';
    form.translation = '';
    form.rule = '';
    form.newListName = '';
    setInitialSelectedList();

    await nextTick();
    wordInputRef.value?.focus();
  }
);

const focusTranslation = () => {
  translationInputRef.value?.focus();
};

const focusRule = () => {
  ruleInputRef.value?.focus();
};

const validateLocally = () => {
  clearErrors();

  if (form.word.trim() === '') {
    fieldErrors.word = 'Word is required.';
  }

  if (form.translation.trim() === '') {
    fieldErrors.translation = 'Translation is required.';
  }

  if (isCreatingNewList.value && form.newListName.trim() === '') {
    fieldErrors.new_list_name = 'New list name is required.';
  }

  return !fieldErrors.word && !fieldErrors.translation && !fieldErrors.new_list_name;
};

const applyBackendErrors = (error) => {
  const data = error?.response?.data;

  if (error?.response?.status !== 422) {
    generalError.value = 'Unable to save word.';
    return;
  }

  if (data?.message && typeof data.message === 'string') {
    generalError.value = data.message;
  }

  const backendErrors = data?.errors;
  if (!backendErrors || typeof backendErrors !== 'object') return;

  if (Array.isArray(backendErrors.word) && backendErrors.word[0]) {
    fieldErrors.word = backendErrors.word[0];
  }

  if (Array.isArray(backendErrors.translation) && backendErrors.translation[0]) {
    fieldErrors.translation = backendErrors.translation[0];
  }

  if (Array.isArray(backendErrors.rule) && backendErrors.rule[0]) {
    fieldErrors.rule = backendErrors.rule[0];
  }

  if (Array.isArray(backendErrors.new_list_name) && backendErrors.new_list_name[0]) {
    fieldErrors.new_list_name = backendErrors.new_list_name[0];
  }

  if (!generalError.value && Array.isArray(backendErrors.message) && backendErrors.message[0]) {
    generalError.value = backendErrors.message[0];
  }
};

const submit = async () => {
  if (!validateLocally()) return;

  loading.value = true;
  clearErrors();

  const creatingNewList = isCreatingNewList.value;
  const payload = {
    word: form.word.trim(),
    translation: form.translation.trim(),
    rule: form.rule.trim() || null,
  };

  if (creatingNewList) {
    payload.new_list_name = form.newListName.trim();
  } else {
    payload.word_list_id = Number(selectedList.value);
  }

  try {
    const response = await api.post('/api/words', payload);
    const createdWordListId = response?.data?.word_list_id || null;

    if (creatingNewList && createdWordListId) {
      lastSelectedList.value = String(createdWordListId);
    } else {
      lastSelectedList.value = selectedList.value;
    }

    emit('saved', {
      createdNewList: creatingNewList,
      wordListId: createdWordListId,
    });
    emit('close');
  } catch (error) {
    applyBackendErrors(error);
  } finally {
    loading.value = false;
  }
};
</script>
