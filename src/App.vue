<template>
  <div id="app" :class="isSampleList ? '' : 'min-h-screen'">
    <ThemeToggle />
    <FileUpload @fileProcessed="handleFileProcessed" />
    <WordMatching
      v-if="words.length"
      :words="words"
      :fileName="fileName"
      :theme="theme"
      :isSampleList="isSampleList"
    />
    <AboutText v-if="isSampleList" />
  </div>
</template>

<script>
import ThemeToggle from "./components/ThemeToggle.vue";
import FileUpload from "./components/FileUpload.vue";
import WordMatching from "./components/WordMatching.vue";
import AboutText from "./components/AboutText.vue";

export default {
  name: "App",
  components: {
    ThemeToggle,
    FileUpload,
    WordMatching,
    AboutText,
  },
  data() {
    return {
      words: [], // Current list of words
      fileName: "", // Current file name
      theme: "light", // Current theme
      isSampleList: true, // Tracks whether the current list is the sample list
      sampleWords: [
        { word: "bear", match: "https://img.freepik.com/premium-vector/cartoon-bear-sitting-character-illustration-isolated-white-background_338371-1217.jpg" },
        { word: "hello", match: "bonjour" },
        // Math Practice Example
        { word: "5 + 3", match: "8" },
        { word: "7 x 6", match: "42" },

        // Definition Learning Example
        { word: "Radius of a circle", match: "A line segment from the center of the circle to its edge" },

        // Memorizing Commands Example
        { word: "rm filename.txt", match: "Delete file using Linux terminal" },

        // Exam Preparation Example
        { word: "E = mc²", match: "Energy-Mass Equivalence" },

        // Geography Example
        { word: "Capital of Canada", match: "Ottawa" },
        { word: "Eiffel Tower", match: "Paris" },

        // Logical Thinking Example
        { word: "What has keys but can't open locks?", match: "Keyboard" },

        // IT and Networking Example
        { word: "HTTP 404", match: "Page Not Found Error" }
      ],
    };
  },
  methods: {
    handleFileProcessed({ words, fileName }) {
      this.words = words;
      this.fileName = fileName;
      this.isSampleList = false; // Set to false because the user uploaded a custom file
    },
  },
  created() {
    // Initialize with the sample list
    this.words = this.sampleWords;
  },
};
</script>
