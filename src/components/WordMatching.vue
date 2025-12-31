<template>
  <div
    :class="[
      'flex flex-col items-center space-y-6',
      theme === 'dark' ? 'dark' : ''
    ]"
    @click="handleContainerClick"
  >
    <div v-if="localWords.length && shuffledMatches.length" class="w-full">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-white text-center mb-4">
        Words and Matches
      </h3>
      <ul class="space-y-2">
        <li
          v-for="(item, index) in localWords"
          :key="index"
          class="flex justify-around"
        >
          <!-- Left Column -->
          <div class="relative w-5/12">
            <button
              v-if="item.incorrect || (item.matched && item.rule)"
              type="button"
              class="absolute top-2 right-2 w-6 h-6 rounded-full border border-gray-400 text-gray-700 text-xs flex items-center justify-center bg-white/80 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700"
              @click.stop="openRuleModal(item, $event)"
              :aria-label="item.incorrect ? 'Show correct answer' : 'Show rule'"
            >
              ?
            </button>
            <div
              class="w-full flex items-center justify-center p-4 border-4 border-gray-200 dark:border-gray-700 rounded-lg md:text-xl"
              :class="[
                item.matched
                  ? 'bg-green-100 text-green-800 pointer-events-none'
                  : item.incorrect
                  ? 'bg-red-100 text-red-800 pointer-events-none'
                  : selected.left === index
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
              @click.stop="selectWord(index, 'left')"
            >
            <img
              v-if="isImageUrl(item.word)"
              :src="item.word"
              alt="Image"
              class="max-w-full max-h-20 rounded"
            />
            <span v-else>{{ item.word }}</span>
            </div>
          </div>

          <!-- Right Column -->
          <div
            class="w-5/12 flex items-center justify-center p-4 border-4 border-gray-200 dark:border-gray-700 rounded-lg md:text-xl"
            :class="[
              shuffledMatches[index]?.matched
                ? 'bg-green-100 text-green-800 pointer-events-none'
                : selected.right === index
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600',
            ]"
            @click.stop="selectWord(index, 'right')"
          >
            <img
              v-if="isImageUrl(shuffledMatches[index]?.match)"
              :src="shuffledMatches[index]?.match"
              alt="Image"
              class="max-w-full max-h-20 rounded"
            />
            <span v-else>{{ shuffledMatches[index]?.match }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-4 text-center pb-6">
      <p class="text-lg font-bold text-gray-700 dark:text-white mb-4">
        Your result: {{ successRate }}%
      </p>
      <!-- Download Sample File Button -->
      <button
        v-if="showDownloadSample"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click.stop="downloadSampleFile"
      >
        Download Sample File
      </button>
      <!-- Download Errors Button -->
      <button
        v-if="showDownload"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click.stop="downloadErrors"
      >
        Download Errors
      </button>
      <button
        v-if="showDownload && showPlayAgain"
        class="px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
        @click.stop="playAgain"
      >
        Play again
      </button>
      <p
        v-else-if="allWordsProcessed"
        class="text-gray-500 dark:text-gray-400"
      >
        No errors to download. Great job!
      </p>
      <button
        v-if="allWordsProcessed && !showDownload && showPlayAgain"
        class="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
        @click.stop="playAgain"
      >
        Play again
      </button>
    </div>

    <div
      v-if="isRuleModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeRuleModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-11/12 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          ref="ruleModalCloseButton"
          type="button"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          @click="closeRuleModal"
          aria-label="Close rule dialog"
        >
          ✕
        </button>
        <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {{ activeRuleHeading }}
        </h4>
        <div v-if="isRuleModalIncorrect" class="mb-4">
          <p class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Answer is:
          </p>
          <div v-if="activeCorrectIsImage" class="flex items-center justify-center">
            <img
              v-if="!correctImageFailed"
              :src="activeCorrectMatch"
              alt="Correct answer image"
              class="max-w-full max-h-64 object-contain rounded"
              @error="handleCorrectImageError"
            />
            <p v-else class="text-gray-800 dark:text-gray-100">
              Image unavailable
            </p>
          </div>
          <p v-else class="text-gray-800 dark:text-gray-100">
            {{ activeCorrectMatch }}
          </p>
        </div>
        <div v-if="activeRuleText">
          <p class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Rule:
          </p>
          <p class="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
            {{ activeRuleText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExcelJS from "exceljs";
import { rule } from "postcss";
import { nextTick } from "vue";

export default {
  name: "WordMatching",
  props: {
    words: {
      type: Array,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      default: "",
    },
    sheetId: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    csvDelimiter: {
      type: String,
      default: ",",
    },
    theme: {
      type: String,
      required: true,
    },
    isSampleList: {
      type: Boolean,
      default: false, // Indicates if the list is the sample list
    },
    demoSheets: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localWords: [],
      shuffledMatches: [],
      selected: { left: null, right: null },
      incorrectPairs: [],
      isRuleModalOpen: false,
      activeRuleText: "",
      activeRuleWord: "",
      activeCorrectMatch: "",
      isRuleModalIncorrect: false,
      activeCorrectIsImage: false,
      correctImageFailed: false,
      lastFocusedElement: null,
    };
  },
  computed: {
    activeRuleHeading() {
      if (this.isRuleModalIncorrect) return `Result for ${this.activeRuleWord}`;
      return `Rule for ${this.activeRuleWord}`;
    },
  },
  computed: {
    successRate() {
      if (this.localWords.length === 0) return 0;
      const correctCount = this.localWords.filter((item) => item.matched).length;
      return Math.round((correctCount / this.localWords.length) * 100);
    },
    showDownload() {
      return (
        this.localWords.every((item) => item.matched || item.incorrect) &&
        this.incorrectPairs.length > 0
      );
    },
    allWordsProcessed() {
      return this.localWords.every((item) => item.matched || item.incorrect);
    },
    showDownloadSample() {
      return !this.showDownload && this.isSampleList;
    },
    showPlayAgain() {
      return this.allWordsProcessed && !this.isSampleList;
    },
  },
  watch: {
    words: {
      immediate: true,
      handler(newWords) {
        this.resetState(newWords);
        this.restoreProgress();
      },
    },
    sheetId() {
      this.restoreProgress();
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    isImageUrl(value) {
      if (typeof value !== "string") return false;
      try {
        const url = new URL(value);
        return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url.pathname);
      } catch {
        return false;
      }
    },
    shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    shuffleRightWithGuard(leftItems, rightItems) {
      let attempts = 0;
      let shuffled = this.shuffleArray([...rightItems]);
      while (
        attempts < 2 &&
        shuffled.every((item, index) => item.match === leftItems[index]?.match)
      ) {
        shuffled = this.shuffleArray([...rightItems]);
        attempts += 1;
      }
      return shuffled;
    },
    selectWord(index, column) {
      if (column === "left") {
        this.selected.left = this.selected.left === index ? null : index;
      } else if (column === "right") {
        this.selected.right = this.selected.right === index ? null : index;
      }

      if (this.selected.left !== null && this.selected.right !== null) {
        const left = this.localWords[this.selected.left];
        const right = this.shuffledMatches[this.selected.right];

        // Value-based matching: correct when values match, regardless of original row position.
        // Multiple words can share the same correct match (e.g. gender/category); cross-row picks are valid.
        if (left.match === right.match) {
          left.matched = true;
          right.matched = true;
          left.selectedMatch = right.match;
        } else {
          left.incorrect = true;
          left.selectedMatch = right.match;
          this.incorrectPairs.push({ word: left.word, correct: left.match, rule: left.rule || "" });
        }

        this.selected.left = null;
        this.selected.right = null;
        this.saveProgress();
      }
    },
    openRuleModal(item, event) {
      this.lastFocusedElement = event?.currentTarget || null;
      this.activeRuleText = item.rule || "";
      this.activeRuleWord = item.word || "";
      this.activeCorrectMatch = item.match || "";
      this.isRuleModalIncorrect = Boolean(item.incorrect);
      this.activeCorrectIsImage =
        this.isRuleModalIncorrect && this.isImageUrl(this.activeCorrectMatch);
      this.correctImageFailed = false;
      this.isRuleModalOpen = true;
      nextTick(() => {
        this.$refs.ruleModalCloseButton?.focus();
      });
    },
    closeRuleModal() {
      this.isRuleModalOpen = false;
      this.activeRuleText = "";
      this.activeRuleWord = "";
      this.activeCorrectMatch = "";
      this.isRuleModalIncorrect = false;
      this.activeCorrectIsImage = false;
      this.correctImageFailed = false;
      if (this.lastFocusedElement?.focus) {
        this.lastFocusedElement.focus();
      }
      this.lastFocusedElement = null;
    },
    handleCorrectImageError() {
      this.correctImageFailed = true;
    },
    handleKeydown(event) {
      if (event.key === "Escape" && this.isRuleModalOpen) {
        this.closeRuleModal();
      }
    },
    handleContainerClick(event) {
      const isWordDiv = event.target.closest(".hover\\:bg-gray-200");
      if (!isWordDiv) this.clearSelection();
    },
    clearSelection() {
      this.selected.left = null;
      this.selected.right = null;
    },
    async downloadSampleFile() {
      const workbook = new ExcelJS.Workbook();
      const sheets = this.demoSheets.length
        ? this.demoSheets
        : [
            {
              name: "Sample",
              rows: [
                { word: "bear", match: "https://img.freepik.com/premium-vector/cartoon-bear-sitting-character-illustration-isolated-white-background_338371-1217.jpg" },
                { word: "hello", match: "bonjour", rule: "add rule: French greeting (column is optional)" },
                { word: "rm filename.txt", match: "delete file", rule: "command to remove a file in Unix-based systems (filename.txt is the file to be deleted)" },
                { word: "cat", match: "gato" },
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
                { word: "cihna", match: "chain", rule: "anagram" },
              ],
            },
          ];

      sheets.forEach((sheet) => {
        const worksheet = workbook.addWorksheet(sheet.name);
        sheet.rows.forEach(({ word, match, rule }) => worksheet.addRow([word, match, rule || ""]));
      });

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "sample-file.xlsx";
      link.click();
    },
    async downloadErrors() {
      if (this.fileType === "csv") {
        const delimiter = this.csvDelimiter || ",";
        const rows = this.incorrectPairs.map(({ word, correct, rule }) => [
          word,
          correct,
          rule || "",
        ]);
        const csvContent = rows.map((row) => row.map(this.escapeCsvCell).join(delimiter)).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${this.fileName || "output"}-errors.csv`;
        link.click();
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Errors");

      // Add incorrect pairs without headers
      this.incorrectPairs.forEach(({ word, correct, rule }) => worksheet.addRow([word, correct, rule || ""]));

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${this.fileName?.replace(".xlsx", "") || "output"}-errors.xlsx`;
      link.click();
    },
    playAgain() {
      this.clearProgress();
      this.resetState(this.words);
    },

    resetState(newWords) {
      this.localWords = [];
      this.shuffledMatches = [];
      this.selected = { left: null, right: null };
      this.incorrectPairs = [];

      if (Array.isArray(newWords) && newWords.length > 0) {
        const leftItems = this.shuffleArray(
          newWords.map(({ word, match, rule }) => ({
          word,
          match,
          rule,
          matched: false,
          incorrect: false,
          selectedMatch: "",
          }))
        );
        const rightItems = newWords.map(({ match }) => ({ match, matched: false }));

        this.localWords = leftItems;
        this.shuffledMatches = this.shuffleRightWithGuard(leftItems, rightItems);
      }
    },
    getProgressKey() {
      if (!this.fileId || !this.sheetId) return "";
      return `wm_progress::${this.fileId}::${this.sheetId}`;
    },
    saveProgress() {
      const key = this.getProgressKey();
      if (!key) return;
      const answered = {};

      this.localWords.forEach((item) => {
        if (item.matched || item.incorrect) {
          answered[item.word] = {
            selectedMatch: item.selectedMatch || item.match,
            isCorrect: item.matched,
          };
        }
      });

      const payload = { answered };
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Ignore storage errors.
      }
    },
    restoreProgress() {
      const key = this.getProgressKey();
      if (!key || this.localWords.length === 0) return;
      let raw = null;
      try {
        raw = localStorage.getItem(key);
      } catch {
        return;
      }
      if (!raw) return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }

      const answered = parsed?.answered || {};
      this.incorrectPairs = [];
      this.shuffledMatches.forEach((item) => {
        item.matched = false;
      });

      this.localWords.forEach((item) => {
        const entry = answered[item.word];
        if (!entry) return;

        item.selectedMatch = entry.selectedMatch || "";
        if (entry.isCorrect) {
          item.matched = true;
          const matchItem = this.shuffledMatches.find(
            (candidate) => !candidate.matched && candidate.match === item.match
          );
          if (matchItem) {
            matchItem.matched = true;
          }
        } else {
          item.incorrect = true;
          this.incorrectPairs.push({ word: item.word, correct: item.match, rule: item.rule || "" });
        }
      });
    },
    clearProgress() {
      const key = this.getProgressKey();
      if (!key) return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors.
      }
    },
    escapeCsvCell(value) {
      const stringValue = value === null || value === undefined ? "" : String(value);
      if (stringValue.includes("\"")) {
        return `"${stringValue.replace(/\"/g, "\"\"")}"`;
      }
      if (stringValue.includes("\n") || stringValue.includes("\r") || stringValue.includes(this.csvDelimiter)) {
        return `"${stringValue}"`;
      }
      return stringValue;
    },
  },
};
</script>
