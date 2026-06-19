import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/api/generated/prisma/client.ts',
);

const source = await readFile(clientPath, 'utf8');
const patched = source
  .replace("import { fileURLToPath } from 'node:url'\n", '')
  .replace(
    "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))",
    "globalThis['__dirname'] = __dirname",
  );

if (patched === source) {
  throw new Error(`Prisma client patch did not match ${clientPath}`);
}

await writeFile(clientPath, patched);
