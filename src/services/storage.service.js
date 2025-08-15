
import fsPkg from 'fs-extra';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../db');
const { ensureDir, writeJson, readdir, readJson, remove } = fsPkg;

export async function saveConfig(key, config) {
  await ensureDir(DB_PATH);
  await writeJson(join(DB_PATH, `${key}.json`), config);
}

export async function getAllConfigs() {
  await ensureDir(DB_PATH);
  const files = await readdir(DB_PATH);
  const configs = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const config = await readJson(join(DB_PATH, file));
      configs.push(config);
    }
  }
  return configs;
}

export async function deleteConfig(key) {
  await remove(join(DB_PATH, `${key}.json`));
}