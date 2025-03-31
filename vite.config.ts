import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defined as definedUtils } from './src/defined';
import dotenv from 'dotenv';

dotenv.config();

const define = Object.keys(definedUtils).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
  return acc;
}, {});

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'bundle',
    },
    // We're using using host version of react, prevents error on missmatched version
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  define,
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
