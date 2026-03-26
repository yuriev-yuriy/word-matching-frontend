<template>
  <div class="grid gap-6 lg:grid-cols-12">
    <section class="min-w-0 space-y-6 lg:col-span-8">
      <UiCard>
        <FileUpload
          :isAuthenticated="authState.isAuthenticated"
          :demoSheets="sampleSheets"
          :demoActiveIndex="activeDemoSheetIndex"
          @demoSheetSelected="handleDemoSheetSelected"
          @fileProcessed="handleFileProcessed"
          @importFileSelected="handleImportFileSelected"
        />
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
  methods: {
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
      this.currentTrainingListId = listId;
      this.trainingMessage = "";
      this.isTrainingLoading = true;

      try {
        const response = await api.get(`/api/word-lists/${listId}/words`);

        if (this.currentTrainingListId !== listId) {
          return;
        }

        const mappedWords = Array.isArray(response.data)
          ? response.data.map((item) => ({
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

        this.words = mappedWords;
        this.trainingMessage = "";
        this.fileName = `Word List ${listId}`;
        this.fileId = `word-list:${listId}`;
        this.sheetId = "words";
        this.fileType = "";
        this.csvDelimiter = ",";
        this.isSampleList = false;
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
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.syncViewport);
    window.removeEventListener("app:start-training", this.handleGlobalStartTraining);
  },
};
</script>
