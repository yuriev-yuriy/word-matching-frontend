<template>
  <div class="grid gap-6 lg:grid-cols-12">
    <section class="min-w-0 space-y-6 lg:col-span-8">
      <UiCard>
        <FileUpload
          :isAuthenticated="authState.isAuthenticated"
          :hasWords="words.length > 0"
          :demoSheets="sampleSheets"
          :demoActiveIndex="activeDemoSheetIndex"
          @demoSheetSelected="handleDemoSheetSelected"
          @fileProcessed="handleFileProcessed"
          @importFileSelected="handleImportFileSelected"
        />
      </UiCard>

      <UiCard v-if="showDueSummaryBlock">
        <div class="space-y-3">
          <p v-if="dueCount > 0" class="text-base text-zinc-700 dark:text-zinc-200">
            You have {{ dueCount }} words to review today
          </p>
          <p v-else class="text-base text-zinc-700 dark:text-zinc-200">
            No words to review today
          </p>

          <div v-if="dueCount > 0" class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
              @click="startDueReview"
            >
              Repeat words
            </button>
            <select
              v-model.number="selectedLimit"
              class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </UiCard>

      <UiCard v-if="isTrainingLoading || trainingMessage || words.length">
        <div
          v-if="isTrainingLoading"
          class="flex min-h-[280px] items-center justify-center"
        >
          <div class="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
            <span class="h-7 w-7 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-400" />
            <span class="text-lg font-medium">Loading words...</span>
          </div>
        </div>
        <div
          v-else-if="trainingMessage"
          class="flex min-h-[280px] items-center justify-center text-center"
        >
          <p class="text-base text-zinc-600 dark:text-zinc-300">
            {{ trainingMessage }}
          </p>
        </div>
        <WordMatching
          v-else
          :words="words"
          :fileName="fileName"
          :fileId="fileId"
          :sheetId="sheetId"
          :fileType="fileType"
          :csvDelimiter="csvDelimiter"
          :theme="theme"
          :isSampleList="isSampleList"
          :demoSheets="sampleSheets"
        />
      </UiCard>

      <UiCard v-if="!authState.isAuthenticated && !isDesktopViewport">
        <AboutText />
      </UiCard>
    </section>

    <aside class="space-y-6 lg:col-span-4 hidden lg:block">
      <UiCard v-if="!authState.isAuthenticated">
        <AboutText />
      </UiCard>
      <UiCard v-else>
        <WordListManager
          :importRequest="importRequest"
          @start-training="handleStartTraining"
        />
      </UiCard>
    </aside>
  </div>
</template>

<script>
import FileUpload from "../components/FileUpload.vue";
import WordMatching from "../components/WordMatching.vue";
import AboutText from "../components/AboutText.vue";
import WordListManager from "../components/WordListManager.vue";
import UiCard from "../components/ui/Card.vue";
import api from "../services/api";
import { authState } from "../state/auth";

export default {
  name: "HomeView",
  components: {
    FileUpload,
    WordMatching,
    AboutText,
    WordListManager,
    UiCard,
  },
  data() {
    return {
      authState,
      importRequest: null,
      words: [],
      fileName: "",
      fileId: "",
      sheetId: "",
      fileType: "",
      csvDelimiter: ",",
      isTrainingLoading: false,
      trainingMessage: "",
      theme: "light",
      isDesktopViewport: false,
      isSampleList: true,
      dueCount: 0,
      selectedLimit: 20,
      activeDemoSheetIndex: 0,
      currentTrainingListId: null,
      sampleSheets: [
        {
          name: "Sample",
          rows: [
            { word: "bear", match: "https://img.freepik.com/premium-vector/cartoon-bear-sitting-character-illustration-isolated-white-background_338371-1217.jpg" },
            { word: "hello", match: "bonjour", rule: "add rule: French greeting (column is optional)" },
            { word: "5 + 3", match: "8" },
            { word: "7 x 6", match: "42" },
            { word: "Radius of a circle", match: "A line segment from the center of the circle to its edge" },
            { word: "rm filename.txt", match: "Delete file using Linux terminal", rule: "command to remove a file in Unix-based systems (filename.txt is the file to be deleted)" },
            { word: "E = mc²", match: "Energy-Mass Equivalence" },
            { word: "Capital of Canada", match: "Ottawa" },
            { word: "Eiffel Tower", match: "Paris" },
            { word: "What has keys but can't open locks?", match: "Keyboard" },
            { word: "HTTP 404", match: "Page Not Found Error" }
          ],
        },
        {
          name: "Anagrams",
          rows: [
            { word: "dbare", match: "bread", rule: "anagram" },
            { word: "leapp", match: "apple", rule: "anagram" },
            { word: "racel", match: "clear", rule: "anagram" },
            { word: "elstni", match: "listen", rule: "anagram" },
            { word: "aertch", match: "teacher", rule: "anagram" },
            { word: "tca", match: "cat", rule: "anagram" },
            { word: "god", match: "dog", rule: "anagram" },
            { word: "stop", match: "pots", rule: "anagram" },
            { word: "stare", match: "tears", rule: "anagram" },
            { word: "cihna", match: "chain", rule: "anagram" }
          ],
        },
      ],
    };
  },
  computed: {
    hasActiveReviewSession() {
      return this.isTrainingLoading || this.trainingMessage || (this.words.length > 0);
    },
    showDueSummaryBlock() {
      return this.authState.isAuthenticated && !this.hasActiveReviewSession;
    },
  },
  watch: {
    "authState.isAuthenticated"(isAuthenticated) {
      if (isAuthenticated) {
        this.fetchDueCount();
      } else {
        this.dueCount = 0;
      }
    },
  },
  methods: {
    shouldResetTrainingSession(currentListId = null) {
      try {
        const raw = localStorage.getItem("training_session");
        const session = raw ? JSON.parse(raw) : null;
        if (!session) return true;
        const sessionListId = session.listId;
        const targetListId = currentListId;
        if (sessionListId !== targetListId) {
          return true;
        }
        return session.isFinished === true;
      } catch {
        return true;
      }
    },
    resetTrainingSessionState() {
      try {
        localStorage.removeItem("training_answers");
        localStorage.removeItem("training_progress");
        localStorage.removeItem("training_session");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("wm_progress::")) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Ignore storage errors.
      }

      this.words = [];
      this.trainingMessage = "";
      this.currentTrainingListId = null;
      this.fileName = "";
      this.fileId = "";
      this.sheetId = "";
      this.fileType = "";
      this.csvDelimiter = ",";
    },
    async fetchDueCount() {

      try {
        const response = await api.get("/api/training/due-count");
        this.dueCount = Number(response?.data?.due_count) || 0;
      } catch (_) {
        this.dueCount = 0;
      }
    },
    async startDueReview() {
      if (this.isTrainingLoading) return;
      if (this.shouldResetTrainingSession("due")) {
        this.resetTrainingSessionState();
      }
      this.isTrainingLoading = true;

      try {
        const response = await api.get("/api/training/due", {
          params: {
            limit: this.selectedLimit,
          },
        });

        const wordsArray = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        const mappedWords = wordsArray.map((item) => ({
          id: item.id,
          word: item.word,
          match: item.translation,
          rule: item.hint || "",
        }));

        if (mappedWords.length === 0) {
          this.words = [];
          this.trainingMessage = "No words to review today";
          return;
        }

        this.fileName = "Due Review";
        this.fileId = "due-review";
        this.sheetId = "due";
        this.fileType = "";
        this.csvDelimiter = ",";
        this.isSampleList = false;
        this.trainingMessage = "";
        this.words = mappedWords;
      } catch (error) {
        console.error("Failed to load due words", error);
        this.trainingMessage = "Failed to load review words. Please try again.";
      } finally {
        this.isTrainingLoading = false;
      }
    },
    handleImportFileSelected(file) {
      this.importRequest = {
        file,
        timestamp: Date.now(),
      };
    },
    handleFileProcessed({ words, fileName, fileId, sheetId, fileType, csvDelimiter }) {
      this.trainingMessage = "";
      this.isTrainingLoading = false;
      this.words = words;
      this.fileName = fileName;
      this.fileId = fileId || "";
      this.sheetId = sheetId || "";
      this.fileType = fileType || "";
      this.csvDelimiter = csvDelimiter || ",";
      this.isSampleList = false;
    },
    handleDemoSheetSelected(index) {
      this.activeDemoSheetIndex = index;
      const sheet = this.sampleSheets[index];
      if (!sheet) return;
      this.trainingMessage = "";
      this.isTrainingLoading = false;
      this.words = sheet.rows;
      this.fileName = sheet.name;
      this.isSampleList = true;
      this.fileId = "";
      this.sheetId = "";
      this.fileType = "";
      this.csvDelimiter = ",";
    },
    async handleStartTraining(listId) {
      if (this.shouldResetTrainingSession(listId)) {
        this.resetTrainingSessionState();
      }
      this.currentTrainingListId = listId;
      this.isTrainingLoading = true;

      try {
        const response = await api.get(`/api/word-lists/${listId}/words`);

        if (this.currentTrainingListId !== listId) {
          return;
        }

        const mappedWords = Array.isArray(response.data)
          ? response.data.map((item) => ({
              id: item.id,
              word: item.word,
              match: item.translation,
              rule: item.hint || "",
            }))
          : [];

        if (mappedWords.length === 0) {
          this.words = [];
          this.trainingMessage = "This list has no words yet.";
          return;
        }

        this.fileName = `Word List ${listId}`;
        this.fileId = `word-list:${listId}`;
        this.sheetId = "words";
        this.fileType = "";
        this.csvDelimiter = ",";
        this.isSampleList = false;
        this.trainingMessage = "";
        this.words = mappedWords;
      } catch (error) {
        console.error("Failed to load list words", error);
      } finally {
        this.isTrainingLoading = false;
      }
    },
    handleGlobalStartTraining(event) {
      const listId = event?.detail?.listId;
      if (!listId) return;
      this.handleStartTraining(listId);
    },
    syncViewport() {
      if (typeof window === "undefined") return;
      this.isDesktopViewport = window.innerWidth >= 1024;
    },
  },
  created() {
    this.words = this.sampleSheets[0]?.rows || [];
    this.fileName = this.sampleSheets[0]?.name || "";
    this.syncViewport();
  },
  mounted() {
    window.addEventListener("resize", this.syncViewport);
    window.addEventListener("app:start-training", this.handleGlobalStartTraining);
    if (this.authState.isAuthenticated) {
      this.fetchDueCount();
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.syncViewport);
    window.removeEventListener("app:start-training", this.handleGlobalStartTraining);
  },
};
</script>
