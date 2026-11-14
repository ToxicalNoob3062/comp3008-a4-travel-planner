import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Lets tests use the same "@/..." imports as the app.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    // Animations really run in these tests, so allow a little more than the default 5 seconds.
    testTimeout: 10000,
  },
});
