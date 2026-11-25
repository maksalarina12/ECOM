import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  build:{
    target:'es2022',
    sourcemap:false,
    chunkSizeWarningLimit:1300,
    rollupOptions:{
      output:{
        manualChunks(id){
          if(id.includes('three')||id.includes('@react-three'))return 'three-vendor';
          if(id.includes('react')||id.includes('zustand'))return 'react-vendor';
        },
      },
    },
  },
});
