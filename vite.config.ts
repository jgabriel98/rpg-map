import { defineConfig } from 'vite';
import path from "path";
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 3000,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },
  build: {
    target: 'esnext',
  },
});
