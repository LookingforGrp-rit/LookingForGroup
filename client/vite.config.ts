/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  const apiPort = Number(env.PORT) || 3000;

  return {
    server: {
      open: true,
      // Expose the dev server on the local network so it can be opened on a
      // phone (same Wi-Fi) for real mobile testing — safe-area insets, touch
      // keyboard, etc. Vite prints a "Network:" URL on startup.
      host: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      environment: "jsdom",
      env: env,
    },
    build: {
      outDir: "build",
    },

    // https://vitejs.dev/config/
    plugins: [react()],
  };
});
