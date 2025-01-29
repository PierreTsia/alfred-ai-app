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
  },
});
