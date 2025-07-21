/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  const apiPort = env.PORT || 8081;

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
    plugins: [react()],
  };
});
