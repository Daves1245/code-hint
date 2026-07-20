import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react({ jsxImportSource: "@opentui/react" })],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "react-reconciler/constants": "react-reconciler/constants.js",
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    typecheck: {
      enabled: true,
    },
    server: {
      // without this, @opentui/react is externalized for SSR and its bare
      // `react-reconciler/constants` import bypasses the alias above entirely
      deps: {
        inline: [/@opentui\/react/],
      },
    },
  },
});
