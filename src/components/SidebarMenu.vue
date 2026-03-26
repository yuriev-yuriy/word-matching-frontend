<template>
    <div
      :class="[
        'fixed top-0 right-0 h-full overflow-y-auto bg-white dark:bg-dark-bg shadow-lg transform transition-transform duration-300 z-50',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'w-11/12 sm:w-10/12 md:w-6/12 lg:w-1/3' // Responsive widths
      ]"
    >
      <div class="p-4 flex justify-between items-center border-b border-gray-200 dark:border-dark-border">
        <h2 v-if="isLoggedIn" class="text-lg font-semibold text-gray-800 dark:text-dark-text">
          Word Lists
        </h2>
        <h2 v-else class="text-lg font-semibold text-gray-800 dark:text-dark-text">
          Greetings! 👋
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
      <template v-if="isLoggedIn">
        <WordListManager @start-training="handleStartTraining" />
      </template>
      <template v-else>
        <div class="p-4 space-y-6 text-gray-700 dark:text-dark-text">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
              How this app works
            </h3>
            <p class="text-sm">
              This app helps you learn and remember information more effectively using simple matching exercises.
            </p>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
              Supported file formats
            </h4>
            <p class="text-sm">You can upload files in XLSX or CSV format.</p>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
              Your file should contain:
            </p>
            <ul class="text-sm list-disc pl-5 space-y-1">
              <li>Column A (required): the question or word</li>
              <li>Column B (required): the correct match or answer</li>
              <li>Column C (optional): a rule or explanation that helps understand why the answer is correct</li>
            </ul>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
              Examples:
            </p>
            <ul class="text-sm list-disc pl-5 space-y-1">
              <li>Word → Translation</li>
              <li>Question → Answer</li>
              <li>Term → Definition</li>
              <li>Image URL → Meaning</li>
              <li>Grammar word → Gender rule</li>
              <li>Anagrams → Correct word (e.g., dbare → bread)</li>
              <li>Riddles → Answer</li>
              <li>Logic puzzles → Solution</li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
              Why repetition matters
            </h4>
            <p class="text-sm">
              Research in cognitive science shows that without repetition, we forget new information very quickly. This effect is known as the forgetting curve.
            </p>
            <a
              href="https://en.wikipedia.org/wiki/Forgetting_curve"
              target="_blank"
              rel="noreferrer"
              class="text-sm text-blue-500 hover:underline mt-2 inline-block"
            >
              https://en.wikipedia.org/wiki/Forgetting_curve
            </a>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
              Learn smarter with spaced repetition
            </h4>
            <p class="text-sm">
              Soon, with our premium plan, you’ll be able to save your files and progress, learn using spaced repetition, and receive short review sessions directly in Telegram.
              This is helpful for parents helping children learn, students preparing for exams, language learners, and anyone studying new material.
            </p>
          </div>
        </div>
      </template>
    </div>
  </template>
  
<script>
  import WordListManager from "./WordListManager.vue";

  export default {
    name: "SidebarMenu",
    components: {
      WordListManager,
    },
    props: {
      isOpen: {
        type: Boolean,
        required: true,
      },
      files: {
        type: Array,
        default: () => [],
      },
      isLoggedIn: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      toggleSidebar() {
        this.$emit("close");
      },
      handleStartTraining(listId) {
        this.$emit("start-training", listId);
        this.$emit("close");
      },
    },
  };
  </script>
  
