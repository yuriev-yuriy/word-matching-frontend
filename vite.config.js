import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // server: {
  //   proxy: {
  //     '/^(\/api|\/login|\/logout|\/register|\/sanctum|\/me)/': {
  //       target: 'http://localhost:8000',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/sanctum': 'http://localhost:8000'
    }
  }
  // server: {
  //   proxy: {
  //     '/api': 'http://localhost:8000',
  //     '/login': 'http://localhost:8000',
  //     '/logout': 'http://localhost:8000',
  //     '/register': 'http://localhost:8000',
  //     '/sanctum': 'http://localhost:8000',
  //     '/me': 'http://localhost:8000'
  //   }
  // }
});
