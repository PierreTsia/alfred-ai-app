import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      // Convex tests use edge-runtime
      ["convex/**", "edge-runtime"],
      ["__tests__/**", "edge-runtime"],
      // Other tests use node
      ["**", "node"],
    ],
    server: { deps: { inline: ["convex-test"] } },
    include: [
      "lib/pdf/**/*.test.ts", // PDF processor tests
      "lib/api/**/*.test.ts", // API tests including embeddings
    ],
    exclude: [
      "**/__tests__/**", // Skip Convex tests for now until we fix the setup
    ],
  },
});
