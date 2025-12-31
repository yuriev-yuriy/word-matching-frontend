<template>
  <div
    id="app"
    :class="[
      'relative min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-50 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950 dark:text-zinc-100',
      isSampleList ? '' : 'pb-10',
    ]"
  >
    <div class="pointer-events-none absolute inset-x-0 top-0 h-64">
      <div class="mx-auto h-64 w-64 -translate-y-10 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/20" />
    </div>

    <header class="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-sm">
            CM
          </div>
          <div>
            <p class="text-lg font-semibold tracking-tight">ClickToMemo</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Smart matching practice</p>
          </div>
        </div>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-2xl hidden md:block">
          Learn faster with smart matching
        </h1>
        <div class="flex items-center gap-3">
          <UiButton variant="secondary" class="hidden sm:inline-flex">
            Try demo
          </UiButton>
          <ThemeToggle :inline="true" />
          <button
            v-if="!isSidebarOpen"
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 md:hidden"
            @click="toggleSidebar"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>

    <!-- Sidebar Menu -->
    <SidebarMenu
      :isOpen="isSidebarOpen"
      :files="files"
      :isLoggedIn="isLoggedIn"
      @close="toggleSidebar"
      @fileLoaded="handleFileLoaded"
    />

    <!-- Open Sidebar Button -->
    <button
      @click="toggleSidebar"
      class="hidden md:inline-flex fixed top-24 left-6 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 z-40"
    >
      Open Menu
    </button>

    <main class="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-12">
        <section class="space-y-6" :class="isSampleList ? 'lg:col-span-8' : 'lg:col-span-12'">
          <!-- <UiCard>
            <div class="space-y-4">
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
                Learn faster with smart matching
              </h1>
              <p class="text-base leading-7 text-zinc-600 dark:text-zinc-300">
                Upload your words, definitions, or image prompts and practice with fast matching rounds designed to reinforce memory.
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <UiButton variant="primary">Start practicing</UiButton>
                <UiButton variant="secondary">Explore demo sheets</UiButton>
              </div>
              <div class="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span class="rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 dark:border-zinc-800/70 dark:bg-zinc-900/50">Trusted by learners</span>
                <span class="rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 dark:border-zinc-800/70 dark:bg-zinc-900/50">Fast recall</span>
                <span class="rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 dark:border-zinc-800/70 dark:bg-zinc-900/50">Spaced repetition</span>
              </div>
            </div>
          </UiCard> -->

          <UiCard>
            <FileUpload
              :demoSheets="sampleSheets"
              :demoActiveIndex="activeDemoSheetIndex"
              @demoSheetSelected="handleDemoSheetSelected"
              @fileProcessed="handleFileProcessed"
            />
          </UiCard>

          <UiCard v-if="words.length">
            <WordMatching
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
          <UiCard class="lg:hidden">
            <AboutText />
          </UiCard>
        </section>

        <aside class="space-y-6 lg:col-span-4 md:hidden lg:block">
          <UiCard v-if="isSampleList">
            <AboutText />
          </UiCard>
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
import ThemeToggle from "./components/ThemeToggle.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import FileUpload from "./components/FileUpload.vue";
import WordMatching from "./components/WordMatching.vue";
import AboutText from "./components/AboutText.vue";
import UiCard from "./components/ui/Card.vue";
import UiButton from "./components/ui/Button.vue";

export default {
  name: "App",
  components: {
    ThemeToggle,
    SidebarMenu,
    FileUpload,
    WordMatching,
    AboutText,
    UiCard,
    UiButton,
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
      isLoggedIn: false, // Placeholder for auth state
      activeDemoSheetIndex: 0,
      sampleSheets: [
        {
          name: "Sample",
          rows: [
            { word: "bear", match: "https://img.freepik.com/premium-vector/cartoon-bear-sitting-character-illustration-isolated-white-background_338371-1217.jpg" },
            { word: "hello", match: "bonjour", rule: "add rule: French greeting (column is optional)" },
            // Math Practice Example
            { word: "5 + 3", match: "8" },
            { word: "7 x 6", match: "42" },

            // Definition Learning Example
            { word: "Radius of a circle", match: "A line segment from the center of the circle to its edge" },

            // Memorizing Commands Example
            { word: "rm filename.txt", match: "Delete file using Linux terminal", rule: "command to remove a file in Unix-based systems (filename.txt is the file to be deleted)" },

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
    handleDemoSheetSelected(index) {
      this.activeDemoSheetIndex = index;
      const sheet = this.sampleSheets[index];
      if (!sheet) return;
      this.words = sheet.rows;
      this.fileName = sheet.name;
      this.isSampleList = true;
      this.fileId = "";
      this.sheetId = "";
      this.fileType = "";
      this.csvDelimiter = ",";
    },
  },
  created() {
    // Initialize with the sample list
    this.words = this.sampleSheets[0]?.rows || [];
    this.fileName = this.sampleSheets[0]?.name || "";

    // Simulate fetching files from the database
    this.files = [
      { id: 1, name: "Sample File 1.xlsx" },
      { id: 2, name: "Math Practice.xlsx" },
      { id: 3, name: "Definitions.xlsx" },
    ];
  },
};
</script>
