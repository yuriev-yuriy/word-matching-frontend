<!-- <template>
    <div>
      <FileUpload @file-uploaded="handleFile" />
      <WordMatching v-if="words.length" :words="words" />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import FileUpload from '../components/FileUpload.vue';
  import WordMatching from '../components/WordMatching.vue';
  
  const words = ref([]);
  
  const handleFile = (uploadedWords) => {
    words.value = uploadedWords;
  };
  </script>
   -->