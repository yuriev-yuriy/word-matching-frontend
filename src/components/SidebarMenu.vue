<template>
    <div
      :class="[
        'fixed top-0 right-0 h-full bg-white dark:bg-dark-bg shadow-lg transform transition-transform duration-300 z-50',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'w-11/12 sm:w-10/12 md:w-6/12 lg:w-1/3' // Responsive widths
      ]"
    >
      <div class="p-4 flex justify-between items-center border-b border-gray-200 dark:border-dark-border">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-dark-text">
          Upload File
        </h2>
        <button
          @click="toggleSidebar"
          class="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <label
          for="file-upload"
          class="block text-gray-700 dark:text-dark-text text-sm font-medium mb-2"
        >
          Drag and drop your file here or click to upload
        </label>
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          class="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400"
        >
          Drag & Drop or <span class="text-blue-500 hover:underline ml-1">Browse</span>
        </div>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,application/csv,application/vnd.oasis.opendocument.spreadsheet"
          class="hidden"
          @change="handleFileUpload"
        />
      </div>
      <div class="p-4">
        <h3 class="text-md font-semibold text-gray-800 dark:text-dark-text mb-2">
          Files in Database
        </h3>
        <ul class="space-y-2">
          <li
            v-for="file in files"
            :key="file.id"
            class="flex justify-between items-center text-gray-700 dark:text-dark-text"
          >
            <span>{{ file.name }}</span>
            <div class="flex space-x-2">
              <button
                @click="loadFile(file)"
                class="text-blue-500 hover:underline"
              >
                Load
              </button>
              <button
                v-if="canDelete(file)"
                @click="deleteFile(file)"
                class="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "SidebarMenu",
    props: {
      isOpen: {
        type: Boolean,
        required: true,
      },
      files: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      toggleSidebar() {
        this.$emit("close");
      },
      handleDrop(event) {
        const file = event.dataTransfer.files[0];
        if (file) {
          this.uploadFile(file);
        }
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.uploadFile(file);
        }
      },
      uploadFile(file) {
        console.log("File to upload:", file);
        // Add logic to upload file
      },
      loadFile(file) {
        console.log("Load file:", file);
        // Add logic to load file
      },
      deleteFile(file) {
        console.log("Delete file:", file);
        // Add logic to delete file
      },
      canDelete(file) {
        // Placeholder logic for determining delete permission
        return false; // Update with actual user_id logic
      },
    },
  };
  </script>
  
