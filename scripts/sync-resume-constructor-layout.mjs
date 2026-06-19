import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const sharedSrc = join(rootDir, "shared/resume-constructor");

const files = [
  "resume-constructor-data.ts",
  "resume-constructor-layout.ts",
];

const destDirs = [
  join(rootDir, "apps/web/src/shared"),
  join(rootDir, "apps/api/src/shared"),
];

for (const destDir of destDirs) {
  mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    copyFileSync(join(sharedSrc, file), join(destDir, file));
  }
}

