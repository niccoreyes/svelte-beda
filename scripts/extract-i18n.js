#!/usr/bin/env node
/**
 * Scans .svelte and .ts files for $t('key'), t('key'), or $_('key') patterns
 * and generates/updates locale JSON files in src/lib/i18n/locale/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const LOCALE_DIR = path.resolve(__dirname, '../src/lib/i18n/locale');
const LOCALES = ['en', 'es', 'ru', 'de'];

const PATTERNS = [
  /\$t\(['"]([\w.:-]+)['"]\)/g,
  /\bt\(['"]([\w.:-]+)['"]\)/g,
  /\$_\(['"]([\w.:-]+)['"]\)/g,
];

function findFiles(dir, extSet, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, extSet, files);
    } else if (extSet.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function extractKeys(content) {
  const keys = new Set();
  for (const re of PATTERNS) {
    let m;
    while ((m = re.exec(content)) !== null) {
      keys.add(m[1]);
    }
  }
  return keys;
}

function loadLocale(pathFile) {
  if (!fs.existsSync(pathFile)) return {};
  return JSON.parse(fs.readFileSync(pathFile, 'utf-8'));
}

function sortKeys(obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort()) {
    sorted[k] = obj[k];
  }
  return sorted;
}

const sourceFiles = findFiles(SRC_DIR, new Set(['.svelte', '.ts']));
const allKeys = new Set();
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const key of extractKeys(content)) {
    allKeys.add(key);
  }
}

if (!fs.existsSync(LOCALE_DIR)) {
  fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

for (const locale of LOCALES) {
  const filePath = path.join(LOCALE_DIR, `${locale}.json`);
  const existing = loadLocale(filePath);
  const updated = { ...existing };

  for (const key of allKeys) {
    if (!(key in updated)) {
      updated[key] = key; // default to key name
    }
  }

  // Remove keys no longer found in source (optional; keeping them is safer)
  // for (const key of Object.keys(updated)) {
  //   if (!allKeys.has(key)) delete updated[key];
  // }

  fs.writeFileSync(filePath, JSON.stringify(sortKeys(updated), null, 2) + '\n');
}

console.log(`Extracted ${allKeys.size} key(s) into ${LOCALES.length} locale file(s).`);
