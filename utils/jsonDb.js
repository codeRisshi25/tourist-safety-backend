import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const dataDir = path.resolve('./data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

function getFilePath(filename) {
  return path.join(dataDir, filename);
}

export function readJson(filename) {
  const fp = getFilePath(filename);
  if (!existsSync(fp)) return [];
  try {
    const raw = readFileSync(fp, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading JSON', filename, e.message);
    return [];
  }
}

export function writeJson(filename, data) {
  const fp = getFilePath(filename);
  try {
    writeFileSync(fp, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed writing JSON', filename, e.message);
    throw e;
  }
}

export default { readJson, writeJson };
