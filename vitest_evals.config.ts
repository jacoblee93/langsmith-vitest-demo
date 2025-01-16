import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["node_modules"],
    include: ["**/*.eval.ts"],
    reporters: ["langsmith/vitest/reporter"],
    setupFiles: ["dotenv/config"],
  },
});
