import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path when served in development or production
  base: '/',
  
  // Build configuration
  build: {
    // Output directory for build files
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Target browsers
    target: 'es2020',
    
    // Minify options
    minify: 'esbuild',
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ['vitest']
        }
      }
    },
    
    // Asset handling
    assetsDir: 'assets',
    
    // Chunk size warning limit (in kB)
    chunkSizeWarningLimit: 1000
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    
    // Hot Module Replacement
    hmr: {
      port: 3001
    }
  },
  
  // Preview server configuration (for built app)
  preview: {
    port: 3002,
    open: true,
    host: true
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // Add any SCSS global variables here if needed in future
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
  
  // Public directory
  publicDir: 'public',
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // Plugin configuration
  plugins: [
    // Add plugins here as needed
  ],
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      // Add dependencies that need to be pre-bundled
    ],
    exclude: [
      // Add dependencies that should not be pre-bundled
    ]
  },
  
  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    format: 'esm'
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles')
    },
    extensions: ['.js', '.ts', '.json', '.css']
  }
});