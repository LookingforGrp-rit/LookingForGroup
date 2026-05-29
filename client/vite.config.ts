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
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
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
    plugins: [react(), nodePolyfills()],
  };
});
