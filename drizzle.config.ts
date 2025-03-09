
import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function dirname(path) {
  return new URL(".", path).pathname;
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "better-sqlite",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./data.db"
  }
});
