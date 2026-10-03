import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT) || 5173;
  const baseUrl =
    env.DELCOM_BASEURL ||
    env.VITE_DELCOM_BASEURL ||
    "https://open-api.delcom.org/api/v1";

  return {
    plugins: [react(), tailwindcss()],
    server: { port },
    preview: { port },
    define: {
      DELCOM_BASEURL: JSON.stringify(baseUrl),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,jsx}"],
        exclude: [
          "node_modules/**",
          "src/main.jsx",
          "src/setupTests.js",
          "src/**/*.test.{js,jsx}",
          "vite.config.js",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
