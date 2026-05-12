import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const source = join(rootDir, "shared/resume-constructor/resume-constructor-layout.ts");
const destinations = [
  join(rootDir, "apps/web/src/shared/resume-constructor-layout.ts"),
  join(rootDir, "apps/api/src/shared/resume-constructor-layout.ts"),
];

for (const destination of destinations) {
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

