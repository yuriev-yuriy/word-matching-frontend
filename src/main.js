import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import './assets/tailwind.css';
import './index.css';

const app = createApp(App);
const head = createHead();
app.use(head); // Add the head manager to the app
app.mount('#app');
