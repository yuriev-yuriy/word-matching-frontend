<template>
    <div class="flex flex-col text-center px-4 py-6">
      <header>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          Welcome to the Word Matching App
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Transform the way you learn and memorize with an interactive matching experience.
        </p>
      </header>
  
      <main class="mt-6 space-y-6">
        <section>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            How Does It Work?
          </h2>
          <ol class="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <strong>Upload or Use a Sample File:</strong>
              <p>
                Start by uploading a custom Excel file or practicing with a sample list to match words, images, or concepts.
              </p>
            </li>
            <li>
              <strong>Match Items:</strong>
              <p>
                Use visual aids, translations, or logical connections to find correct matches.
              </p>
            </li>
            <li>
              <strong>Track Your Progress:</strong>
              <p>
                The app calculates your success rate and highlights incorrect matches. Download error reports to focus on challenging areas.
              </p>
            </li>
          </ol>
        </section>
  
        <section>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            Why Is This App Useful?
          </h2>
          <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong>For Adults:</strong> Improve your memory, study new languages, and prepare for professional certifications or exams.</li>
            <li><strong>For Kids:</strong> Learn basic concepts, practice reading, and train logical thinking with visual aids.</li>
            <li><strong>For Teachers:</strong> Create custom exercises and quizzes for students with an interactive and engaging tool.</li>
            <li><strong>For Everyone:</strong> Build strong cognitive skills and retain information effectively while having fun.</li>
          </ul>
        </section>
  
        <section>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            Get Started Today
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Unleash your potential and take your learning journey to the next level. Upload your file, start matching, and achieve your goals!
          </p>
        </section>
      </main>
  
      <footer class="mt-6 text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 Your App Team. All rights reserved.</p>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: "AboutText",
  };
  </script>