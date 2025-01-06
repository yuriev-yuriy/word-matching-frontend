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
          <div
            class="w-5/12 flex items-center justify-center p-4 border-4 border-gray-200 dark:border-gray-700 rounded-lg md:text-xl"
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

    <div class="mt-4 text-center">
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
      <p
        v-else-if="allWordsProcessed"
        class="text-gray-500 dark:text-gray-400"
      >
        No errors to download. Great job!
      </p>
    </div>
  </div>
</template>

<script>
import ExcelJS from "exceljs";

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
    theme: {
      type: String,
      required: true,
    },
    isSampleList: {
      type: Boolean,
      default: false, // Indicates if the list is the sample list
    },
  },
  data() {
    return {
      localWords: [],
      shuffledMatches: [],
      selected: { left: null, right: null },
      incorrectPairs: [],
    };
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
  },
  watch: {
    words: {
      immediate: true,
      handler(newWords) {
        this.resetState(newWords);
      },
    },
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
    selectWord(index, column) {
      if (column === "left") {
        this.selected.left = this.selected.left === index ? null : index;
      } else if (column === "right") {
        this.selected.right = this.selected.right === index ? null : index;
      }

      if (this.selected.left !== null && this.selected.right !== null) {
        const left = this.localWords[this.selected.left];
        const right = this.shuffledMatches[this.selected.right];

        if (left.match === right.match) {
          left.matched = true;
          right.matched = true;
        } else {
          left.incorrect = true;
          this.incorrectPairs.push({ word: left.word, correct: left.match });
        }

        this.selected.left = null;
        this.selected.right = null;
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
      const worksheet = workbook.addWorksheet("Sample");

      // Sample data
      const sampleData = [
        { word: "bear", match: "https://img.freepik.com/premium-vector/cartoon-bear-sitting-character-illustration-isolated-white-background_338371-1217.jpg" },
        { word: "hello", match: "bonjour" },
        { word: "rm filename.txt", match: "delete file" },
      ];

      // Add rows without headers
      sampleData.forEach(({ word, match }) => worksheet.addRow([word, match]));

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "sample-file.xlsx";
      link.click();
    },
    async downloadErrors() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Errors");

      // Add incorrect pairs without headers
      this.incorrectPairs.forEach(({ word, correct }) => worksheet.addRow([word, correct]));

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${this.fileName?.replace(".xlsx", "") || "output"}-errors.xlsx`;
      link.click();
    },

    resetState(newWords) {
      this.localWords = [];
      this.shuffledMatches = [];
      this.selected = { left: null, right: null };
      this.incorrectPairs = [];

      if (Array.isArray(newWords) && newWords.length > 0) {
        this.localWords = newWords.map(({ word, match }) => ({
          word,
          match,
          matched: false,
          incorrect: false,
        }));
        this.shuffledMatches = this.shuffleArray(
          newWords.map(({ match }) => ({ match, matched: false }))
        );
      }
    },
  },
};
</script>
