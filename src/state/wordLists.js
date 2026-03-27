import { reactive } from 'vue';
import api from '../services/api';

export const wordListsState = reactive({
  lists: [],
  loading: true,
  loaded: false,
  loadPromise: null,
});

export async function ensureWordListsLoaded() {
  if (wordListsState.loaded) return;

  if (!wordListsState.loadPromise) {
    wordListsState.loading = true;
    wordListsState.loadPromise = api.get('/api/word-lists')
      .then((response) => {
        wordListsState.lists = Array.isArray(response.data) ? response.data : [];
        wordListsState.loaded = true;
      })
      .finally(() => {
        wordListsState.loading = false;
        wordListsState.loadPromise = null;
      });
  }

  await wordListsState.loadPromise;
}

export function clearWordLists() {
  wordListsState.lists = [];
  wordListsState.loading = false;
  wordListsState.loaded = false;
  wordListsState.loadPromise = null;
}

export function addWordList(list) {
  if (!list?.id) return;
  if (wordListsState.lists.some((item) => item.id === list.id)) return;

  wordListsState.lists = [
    ...wordListsState.lists,
    list,
  ];
}

export function renameWordList(id, name) {
  const index = wordListsState.lists.findIndex((item) => item.id === id);
  if (index === -1) return;

  wordListsState.lists[index] = {
    ...wordListsState.lists[index],
    name,
  };
}

export function removeWordList(id) {
  const index = wordListsState.lists.findIndex((item) => item.id === id);
  if (index !== -1) {
    wordListsState.lists.splice(index, 1);
  }
}

export function addImportedLists(createdLists) {
  const addedIds = [];

  createdLists.forEach((list) => {
    if (!list?.id) return;
    if (wordListsState.lists.some((item) => item.id === list.id)) return;

    wordListsState.lists = [
      ...wordListsState.lists,
      {
        id: list.id,
        name: list.name,
        words_count: list.words_created ?? 0,
        isNew: true,
      },
    ];
    addedIds.push(list.id);
  });

  return addedIds;
}

export function clearNewFlags(ids) {
  ids.forEach((id) => {
    const target = wordListsState.lists.find((item) => item.id === id);
    if (target) {
      target.isNew = false;
    }
  });
}
