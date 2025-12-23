<template>
  <div class="flex flex-col items-center space-y-6 mt-12">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Upload your Excel file</h2>
    <input
      type="file"
      accept=".xlsx,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/csv,application/vnd.oasis.opendocument.spreadsheet"
      @change="handleFileUpload"
      class="border p-2 rounded dark:bg-gray-800 dark:text-white"
    />
    <div
      v-if="sheetNames.length > 1"
      class="w-full max-w-xl flex items-center gap-2 my-4"
    >
      <button
        v-if="hasTabsOverflow && canScrollLeft"
        type="button"
        class="px-2 py-1 rounded-md border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-200"
        @click="scrollTabs(-1)"
        aria-label="Scroll sheets left"
      >
        ◀
      </button>
      <div
        ref="tabsContainer"
        class="flex-1 overflow-x-auto whitespace-nowrap tabs-scrollbar-hide"
        @scroll="updateTabsScrollState"
      >
        <button
          v-for="(sheetName, index) in sheetNames"
          :key="sheetName"
          type="button"
          class="inline-flex items-center px-3 py-1 mx-1 rounded-full border text-sm transition"
          :class="index === activeSheetIndex
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'"
          @click="selectSheet(index)"
        >
          {{ sheetName }}
        </button>
      </div>
      <button
        v-if="hasTabsOverflow && canScrollRight"
        type="button"
        class="px-2 py-1 rounded-md border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-200"
        @click="scrollTabs(1)"
        aria-label="Scroll sheets right"
      >
        ▶
      </button>
    </div>
  </div>
</template>

<script>
import ExcelJS from "exceljs";
import { nextTick } from "vue";

export default {
  name: "FileUpload",
  data() {
    return {
      workbookRef: null,
      sheetNames: [],
      activeSheetIndex: 0,
      parsedSheetsCache: {},
      currentFileName: "",
      canScrollLeft: false,
      canScrollRight: false,
      hasTabsOverflow: false,
    };
  },
  mounted() {
    window.addEventListener("resize", this.updateTabsScrollState);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateTabsScrollState);
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.resetWorkbookState();
        const rawFileName = file.name || "";
        const extension = rawFileName.split(".").pop()?.toLowerCase() || "";
        const isCsv =
          extension === "csv" ||
          file.type === "text/csv" ||
          file.type === "application/csv" ||
          file.type === "text/plain";

        const jsonData = [];
        const baseFileName = this.stripFileExtension(rawFileName);

        if (isCsv) {
          const text = await file.text();
          const { rows, delimiter } = this.parseCsv(text);

          rows.forEach((row, rowIndex) => {
            if (rowIndex > 0) { // Skip the first row (header)
              const word = this.normalizeCellValue(row[0]);
              const match = this.normalizeCellValue(row[1]);
              if (word && match) {
                jsonData.push({ word, match });
              }
            }
          });

          if (import.meta.env?.DEV) {
            console.log("Detected CSV delimiter:", delimiter, "rows:", rows.length);
          }
        } else {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          this.workbookRef = workbook;
          this.sheetNames = workbook.worksheets
            .slice(0, 10)
            .map((sheet) => sheet.name);
          this.activeSheetIndex = 0;
          this.currentFileName = baseFileName;

          const worksheet = workbook.getWorksheet(1); // Get the first sheet
          if (!worksheet) throw new Error("No worksheet found in the uploaded file.");
          const parsed = this.parseWorksheet(worksheet);
          jsonData.push(...parsed);
          this.parsedSheetsCache = { 0: parsed };
          await nextTick();
          this.updateTabsScrollState();
        }

        console.log("Processed words:", jsonData);

        // Emit the data to the parent component
        this.$emit("fileProcessed", {
          words: jsonData,
          fileName: baseFileName,
        });
      } catch (error) {
        const message = error?.message || "There was an error processing the uploaded file.";
        console.error("Error processing file:", message);
        alert(message);
      }
    },
    async selectSheet(index) {
      if (!this.workbookRef) return;
      if (index === this.activeSheetIndex) return;

      this.activeSheetIndex = index;
      const cached = this.parsedSheetsCache[index];
      const words = cached || this.parseWorksheet(this.workbookRef.worksheets[index]);
      if (!cached) {
        this.parsedSheetsCache = {
          ...this.parsedSheetsCache,
          [index]: words,
        };
      }

      this.$emit("fileProcessed", {
        words,
        fileName: this.currentFileName,
      });

      await nextTick();
      this.updateTabsScrollState();
    },
    parseWorksheet(worksheet) {
      const jsonData = [];

      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex > 0) { // Skip the first row (header)
          const word = this.normalizeCellValue(row.getCell(1).value); // Column A
          const match = this.normalizeCellValue(row.getCell(2).value); // Column B
          const normalizedWord = word.toLowerCase().trim();
          const normalizedMatch = match.toLowerCase().trim();
          if (rowIndex === 1 && normalizedWord && normalizedWord === normalizedMatch) {
            return;
          }
          if (word && match) {
            // Row order is used to ingest pairs, but gameplay matches by value (not original row).
            jsonData.push({ word, match });
          }
        }
      });

      return jsonData;
    },
    parseCsv(text) {
      if (!text) return { rows: [], delimiter: "," };
      const delimiter = this.detectCsvDelimiter(text);
      const rows = [];
      let row = [];
      let cell = "";
      let inQuotes = false;

      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === "\"") {
          if (inQuotes && nextChar === "\"") {
            cell += "\"";
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === delimiter && !inQuotes) {
          row.push(cell);
          cell = "";
          continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
          if (char === "\r" && nextChar === "\n") {
            i += 1;
          }
          row.push(cell);
          cell = "";
          if (row.length > 1 || row[0] !== "") {
            rows.push(row);
          }
          row = [];
          continue;
        }

        cell += char;
      }

      if (inQuotes) {
        throw new Error("Invalid CSV format: unmatched quote.");
      }

      if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        if (row.length > 1 || row[0] !== "") {
          rows.push(row);
        }
      }

      return { rows, delimiter };
    },
    detectCsvDelimiter(text) {
      const lines = text.split(/\r?\n/);
      const firstLine = lines.find((line) => line.trim().length > 0) || "";
      if (!firstLine) return ",";

      const semicolonCount = firstLine.split(";").length;
      const commaCount = firstLine.split(",").length;
      if (firstLine.includes(";") && semicolonCount > commaCount) {
        return ";";
      }

      if (firstLine.includes("\t")) {
        return "\t";
      }

      return ",";
    },
    resetWorkbookState() {
      this.workbookRef = null;
      this.sheetNames = [];
      this.activeSheetIndex = 0;
      this.parsedSheetsCache = {};
      this.currentFileName = "";
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.hasTabsOverflow = false;
    },
    scrollTabs(direction) {
      const container = this.$refs.tabsContainer;
      if (!container) return;
      container.scrollBy({ left: direction * 250, behavior: "smooth" });
    },
    updateTabsScrollState() {
      const container = this.$refs.tabsContainer;
      if (!container) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
        this.hasTabsOverflow = false;
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = container;
      this.hasTabsOverflow = scrollWidth > clientWidth + 1;
      this.canScrollLeft = this.hasTabsOverflow && scrollLeft > 0;
      this.canScrollRight =
        this.hasTabsOverflow && scrollLeft + clientWidth < scrollWidth - 1;
    },
    normalizeCellValue(value) {
      if (typeof value === "string") return value.trim();
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value).trim();
      }
      if (value instanceof Date) return value.toString().trim();
      if (!value || typeof value !== "object") return "";

      if (typeof value.hyperlink === "string") {
        return value.hyperlink.trim() || this.normalizeCellValue(value.text);
      }

      if (typeof value.text === "string") return value.text.trim();

      if (Array.isArray(value.richText)) {
        return value.richText
          .map((part) => (part?.text ? String(part.text) : ""))
          .join("")
          .trim();
      }

      if ("result" in value) {
        return this.normalizeCellValue(value.result);
      }

      return "";
    },
    stripFileExtension(fileName) {
      return fileName.replace(/\.[^.]+$/, "").trim();
    },
  },
};
</script>

<style scoped>
.tabs-scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tabs-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
