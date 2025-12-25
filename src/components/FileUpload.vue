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
      v-if="warnings.length"
      class="w-full max-w-xl space-y-2"
    >
      <div
        v-for="warning in warnings"
        :key="warning.id"
        class="flex items-start justify-between gap-4 border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm rounded-md px-3 py-2 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-100"
      >
        <span>{{ warning.message }}</span>
        <button
          type="button"
          class="text-yellow-700 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100"
          @click="dismissWarning(warning.id)"
          aria-label="Dismiss warning"
        >
          ✕
        </button>
      </div>
    </div>
    <div
      v-if="isErrorModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeErrorModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-11/12 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          @click="closeErrorModal"
          aria-label="Close error dialog"
        >
          ✕
        </button>
        <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Upload error
        </h4>
        <p class="text-gray-700 dark:text-gray-200">
          {{ errorMessage }}
        </p>
      </div>
    </div>
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

const MAX_SHEETS = 10;
const MAX_ROWS = 50;

export default {
  name: "FileUpload",
  data() {
    return {
      workbookRef: null,
      sheetNames: [],
      activeSheetIndex: 0,
      parsedSheetsCache: {},
      currentFileName: "",
      currentFileId: "",
      currentSheetId: "",
      currentFileType: "",
      currentCsvDelimiter: ",",
      canScrollLeft: false,
      canScrollRight: false,
      hasTabsOverflow: false,
      warnings: [],
      isErrorModalOpen: false,
      errorMessage: "",
    };
  },
  mounted() {
    window.addEventListener("resize", this.updateTabsScrollState);
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateTabsScrollState);
    window.removeEventListener("keydown", this.handleKeydown);
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

        const fileId = this.buildFileId(file, baseFileName);
        this.setActiveFileId(fileId);
        this.currentFileId = fileId;
        this.currentFileType = isCsv ? "csv" : "xlsx";

        if (isCsv) {
          const text = await file.text();
          const { rows, delimiter } = this.parseCsv(text);
          const sheetLabel = baseFileName || "CSV";
          this.currentSheetId = "csv";
          this.currentCsvDelimiter = delimiter;
          let totalRows = 0;

          rows.forEach((row, rowIndex) => {
            if (rowIndex > 0) { // Skip the first row (header)
              const word = this.normalizeCellValue(row[0]);
              const match = this.normalizeCellValue(row[1]);
              const rule = this.normalizeOptionalValue(row[2]);
              if (word && match) {
                totalRows += 1;
                if (totalRows <= MAX_ROWS) {
                  jsonData.push({ word, match, ...(rule ? { rule } : {}) });
                }
              }
            }
          });

          if (totalRows > MAX_ROWS) {
            this.addWarning(
              `Sheet "${sheetLabel}": ${totalRows} rows found. Only the first 50 rows were imported. (${totalRows - MAX_ROWS} rows ignored.)`
            );
          }

          if (import.meta.env?.DEV) {
            console.log("Detected CSV delimiter:", delimiter, "rows:", rows.length);
          }
        } else {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          this.workbookRef = workbook;
          const totalSheets = workbook.worksheets.length;
          if (totalSheets > MAX_SHEETS) {
            this.addWarning(
              `This file contains ${totalSheets} sheets. Only the first 10 sheets are available. (${totalSheets - MAX_SHEETS} sheets ignored.)`
            );
          }
          this.sheetNames = workbook.worksheets
            .slice(0, MAX_SHEETS)
            .map((sheet) => sheet.name);
          this.activeSheetIndex = 0;
          this.currentFileName = baseFileName;

          const worksheet = workbook.getWorksheet(1); // Get the first sheet
          if (!worksheet) throw new Error("No worksheet found in the uploaded file.");
          this.currentSheetId = this.getSheetId(worksheet, 0);
          const parsed = this.parseWorksheet(worksheet);
          jsonData.push(...parsed.rows);
          this.parsedSheetsCache = { 0: parsed.rows };
          if (parsed.totalRows > MAX_ROWS) {
            this.addWarning(
              `Sheet "${worksheet.name}": ${parsed.totalRows} rows found. Only the first 50 rows were imported. (${parsed.totalRows - MAX_ROWS} rows ignored.)`
            );
          }
          await nextTick();
          this.updateTabsScrollState();
        }

        console.log("Processed words:", jsonData);

        // Emit the data to the parent component
        this.$emit("fileProcessed", {
          words: jsonData,
          fileName: baseFileName,
          fileId: this.currentFileId,
          sheetId: this.currentSheetId,
          fileType: this.currentFileType,
          csvDelimiter: this.currentCsvDelimiter,
        });
      } catch (error) {
        this.showErrorModal("We couldn't read that file. Please upload a valid CSV or XLSX.");
        console.error("Error processing file:", error?.message || error);
      }
    },
    async selectSheet(index) {
      if (!this.workbookRef) return;
      if (index === this.activeSheetIndex) return;

      this.activeSheetIndex = index;
      const cached = this.parsedSheetsCache[index];
      const worksheet = this.workbookRef.worksheets[index];
      this.currentSheetId = this.getSheetId(worksheet, index);
      const parsed = cached
        ? { rows: cached, totalRows: cached.length }
        : this.parseWorksheet(worksheet);
      const words = parsed.rows;
      if (!cached) {
        this.parsedSheetsCache = {
          ...this.parsedSheetsCache,
          [index]: parsed.rows,
        };
        if (parsed.totalRows > MAX_ROWS) {
          this.addWarning(
            `Sheet "${worksheet.name}": ${parsed.totalRows} rows found. Only the first 50 rows were imported. (${parsed.totalRows - MAX_ROWS} rows ignored.)`
          );
        }
      }

      this.$emit("fileProcessed", {
        words,
        fileName: this.currentFileName,
        fileId: this.currentFileId,
        sheetId: this.currentSheetId,
        fileType: this.currentFileType,
        csvDelimiter: this.currentCsvDelimiter,
      });

      await nextTick();
      this.updateTabsScrollState();
    },
    parseWorksheet(worksheet) {
      const jsonData = [];
      let totalRows = 0;

      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex > 0) { // Skip the first row (header)
          const word = this.normalizeCellValue(row.getCell(1).value); // Column A
          const match = this.normalizeCellValue(row.getCell(2).value); // Column B
          const rule = this.normalizeOptionalValue(row.getCell(3).value); // Column C
          const normalizedWord = word.toLowerCase().trim();
          const normalizedMatch = match.toLowerCase().trim();
          if (rowIndex === 1 && normalizedWord && normalizedWord === normalizedMatch) {
            return;
          }
          if (word && match) {
            // Row order is used to ingest pairs, but gameplay matches by value (not original row).
            totalRows += 1;
            if (totalRows <= MAX_ROWS) {
              jsonData.push({ word, match, ...(rule ? { rule } : {}) });
            }
          }
        }
      });

      return { rows: jsonData, totalRows };
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
      this.currentFileId = "";
      this.currentSheetId = "";
      this.currentFileType = "";
      this.currentCsvDelimiter = ",";
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.hasTabsOverflow = false;
      this.warnings = [];
      this.isErrorModalOpen = false;
      this.errorMessage = "";
    },
    buildFileId(file, baseFileName) {
      if (file?.name && Number.isFinite(file?.size) && Number.isFinite(file?.lastModified)) {
        return `${file.name}::${file.size}::${file.lastModified}`;
      }
      return baseFileName || "unknown-file";
    },
    setActiveFileId(fileId) {
      try {
        const previousId = localStorage.getItem("wm_active_file_id");
        if (previousId && previousId !== fileId) {
          const prefix = `wm_progress::${previousId}::`;
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(prefix)) {
              localStorage.removeItem(key);
            }
          });
        }
        localStorage.setItem("wm_active_file_id", fileId);
      } catch {
        // Ignore storage errors.
      }
    },
    getSheetId(worksheet, index) {
      return worksheet?.name ? `sheet:${worksheet.name}` : `sheet-${index}`;
    },
    addWarning(message) {
      this.warnings.push({ id: `${Date.now()}-${Math.random()}`, message });
    },
    dismissWarning(id) {
      this.warnings = this.warnings.filter((warning) => warning.id !== id);
    },
    showErrorModal(message) {
      this.errorMessage = message;
      this.isErrorModalOpen = true;
    },
    closeErrorModal() {
      this.isErrorModalOpen = false;
      this.errorMessage = "";
    },
    handleKeydown(event) {
      if (event.key === "Escape" && this.isErrorModalOpen) {
        this.closeErrorModal();
      }
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
    normalizeOptionalValue(value) {
      const normalized = this.normalizeCellValue(value);
      return normalized ? normalized : undefined;
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
