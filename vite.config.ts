import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import packageJSON from './package.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    dts({
      outDir: ['build'],
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json'
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      name: packageJSON.name,
      formats: ['cjs', 'es']
    },
    outDir: 'build',
    rollupOptions: {
      external: Object.keys(packageJSON.peerDependencies),
      output: {
        exports: 'named'
      }
    }
  }
});
