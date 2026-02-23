<template>
  <div class="grid gap-6 lg:grid-cols-12">
    <section class="min-w-0 space-y-6" :class="isSampleList ? 'lg:col-span-8' : 'lg:col-span-12'">
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
</template>

<script>
import FileUpload from "../components/FileUpload.vue";
import WordMatching from "../components/WordMatching.vue";
import AboutText from "../components/AboutText.vue";
import UiCard from "../components/ui/Card.vue";

export default {
  name: "HomeView",
  components: {
    FileUpload,
    WordMatching,
    AboutText,
    UiCard,
  },
  data() {
    return {
      words: [],
      fileName: "",
      fileId: "",
      sheetId: "",
      fileType: "",
      csvDelimiter: ",",
      theme: "light",
      isSampleList: true,
      activeDemoSheetIndex: 0,
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
    handleFileProcessed({ words, fileName, fileId, sheetId, fileType, csvDelimiter }) {
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
    this.words = this.sampleSheets[0]?.rows || [];
    this.fileName = this.sampleSheets[0]?.name || "";
  },
};
</script>
