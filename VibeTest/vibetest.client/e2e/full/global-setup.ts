import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export default async function globalSetup(): Promise<void> {
  const dbBase = path.join(rootDir, 'VibeTest.Server', 'vibetest.e2e.db');
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${dbBase}${suffix}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}
