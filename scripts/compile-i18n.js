#!/usr/bin/env node
/**
 * Compiles locale JSON files:
 * - Validates ICU MessageFormat syntax in strings.
 * - Outputs a summary of keys per locale.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALE_DIR = path.resolve(__dirname, '../src/lib/i18n/locale');
const LOCALES = ['en', 'es', 'ru', 'de'];

const ICU_PLACEHOLDER_RE = /\{[^}]+\}/g;

function validateICU(value, key, locale) {
  if (typeof value !== 'string') return;
  const matches = value.match(ICU_PLACEHOLDER_RE);
  if (!matches) return;
  for (const m of matches) {
    const inner = m.slice(1, -1).trim();
    // Allow variable names, numbers, plural/select keywords, and # shorthand placeholders
    if (inner === '#' || /^#[^}]+$/.test(inner)) continue;
    if (!/^[\w_]+\s*(,\s*(plural|select|selectordinal)\s*,?.*)?$/.test(inner)) {
      console.warn(`[${locale}] Potentially invalid ICU in "${key}": ${m}`);
    }
  }
}

for (const locale of LOCALES) {
  const filePath = path.join(LOCALE_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing locale file: ${filePath}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const keys = Object.keys(data);
  for (const key of keys) {
    validateICU(data[key], key, locale);
  }
  console.log(`[${locale}] Compiled ${keys.length} key(s).`);
}

console.log('i18n compilation complete.');
