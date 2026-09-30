import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js", "src/**/*.spec.js"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/services/**/*.js",
        "src/controllers/**/*.js",
        "src/middlewares/**/*.js",
        "src/schemas/**/*.js",
      ],
      exclude: ["src/**/*.test.js", "src/**/*.spec.js"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
