<template>
  <div id="app" :class="isSampleList ? '' : 'min-h-screen'">
    <ThemeToggle />
    <!-- Sidebar Menu -->
    <SidebarMenu
      :isOpen="isSidebarOpen"
      :files="files"
      @close="toggleSidebar"
      @fileLoaded="handleFileLoaded"
    />

    <!-- Open Sidebar Button -->
    <button
      @click="toggleSidebar"
      class="fixed top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 z-50"
    >
      Open Menu
    </button>
    <FileUpload @fileProcessed="handleFileProcessed" />
    <WordMatching
      v-if="words.length"
      :words="words"
      :fileName="fileName"
      :fileId="fileId"
      :sheetId="sheetId"
      :fileType="fileType"
      :csvDelimiter="csvDelimiter"
      :theme="theme"
      :isSampleList="isSampleList"
    />
    <AboutText v-if="isSampleList" />
  </div>
</template>

<script>
import ThemeToggle from "./components/ThemeToggle.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import FileUpload from "./components/FileUpload.vue";
import WordMatching from "./components/WordMatching.vue";
import AboutText from "./components/AboutText.vue";

export default {
  name: "App",
  components: {
    ThemeToggle,
    SidebarMenu,
    FileUpload,
    WordMatching,
    AboutText,
  },
  data() {
    return {
      words: [], // Current list of words
      fileName: "", // Current file name
      fileId: "", // Current file id for progress persistence
      sheetId: "", // Current sheet id for progress persistence
      fileType: "", // Current file type for error export
      csvDelimiter: ",", // CSV delimiter for error export
      theme: "light", // Current theme
      isSampleList: true, // Tracks whether the current list is the sample list
      isSidebarOpen: false, // Tracks whether the sidebar is open
      files: [], // List of files from the database
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
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleFileLoaded(fileData) {
      console.log("Loaded file data:", fileData);
      // Логика для обработки загруженного файла
    },
    handleFileProcessed({ words, fileName, fileId, sheetId, fileType, csvDelimiter }) {
      this.words = words;
      this.fileName = fileName;
      this.fileId = fileId || "";
      this.sheetId = sheetId || "";
      this.fileType = fileType || "";
      this.csvDelimiter = csvDelimiter || ",";
      this.isSampleList = false; // Set to false because the user uploaded a custom file
    },
  },
  created() {
    // Initialize with the sample list
    this.words = this.sampleWords;

    // Simulate fetching files from the database
    this.files = [
      { id: 1, name: "Sample File 1.xlsx" },
      { id: 2, name: "Math Practice.xlsx" },
      { id: 3, name: "Definitions.xlsx" },
    ];
  },
};
</script>
