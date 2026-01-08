import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },

    server: {
        host: true,

        allowedHosts: [
            'myfairpipe.com',
            'www.myfairpipe.com',
        ],

        hmr: {
            protocol: 'wss',
            host: 'www.myfairpipe.com',
            clientPort: 443,
        },
    },
})
