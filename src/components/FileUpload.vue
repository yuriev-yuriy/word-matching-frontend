<template>
  <div class="flex flex-col items-center space-y-6 mt-12">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Upload your Excel file</h2>
    <input
      type="file"
      accept=".xlsx, .xls"
      @change="handleFileUpload"
      class="border p-2 rounded dark:bg-gray-800 dark:text-white"
    />
  </div>
</template>

<script>
import ExcelJS from "exceljs";

export default {
  name: "FileUpload",
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.getWorksheet(1); // Get the first sheet
        if (!worksheet) throw new Error("No worksheet found in the uploaded file.");

        // Process rows (skip header row if present)
        const jsonData = [];
        worksheet.eachRow((row, rowIndex) => {
          if (rowIndex > 0) { // Skip the first row (header)
            const word = row.getCell(1).value?.toString().trim() || ""; // Column A
            const match = row.getCell(2).value?.toString().trim() || ""; // Column B
            if (word && match) {
              jsonData.push({ word, match });
            }
          }
        });

        console.log("Processed words:", jsonData);

        // Emit the data to the parent component
        this.$emit("fileProcessed", { words: jsonData, fileName: file.name });
      } catch (error) {
        console.error("Error processing file:", error.message);
        alert("There was an error processing the uploaded file.");
      }
    },
  },
};
</script>
