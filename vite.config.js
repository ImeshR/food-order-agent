import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'client/voice-client-main.js'),
      name: 'VoiceClient',
      fileName: () => 'voice-client-bundle.js',
      formats: ['iife'],
    },
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
