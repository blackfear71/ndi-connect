import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Séparation des librairies lourdes
                    react: ['react', 'react-dom'],
                    i18n: ['i18next', 'react-i18next'],
                    bootstrap: ['bootstrap']
                }
            }
        }
    }
});
