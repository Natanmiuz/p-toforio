import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const i18nDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n');
const base = join(i18nDir, 'lang');
const config = JSON.parse(readFileSync(join(i18nDir, 'locales.json'), 'utf8'));
const codes = config.locales.map((locale) => locale.code);
const problems = [];

// Every locale in locales.json needs its JSON, and no JSON may be left over.
const onDisk = readdirSync(base).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
for (const code of codes) {
  if (!onDisk.includes(code)) problems.push(`${code}: falta src/i18n/lang/${code}.json`);
}
for (const code of onDisk) {
  if (!codes.includes(code)) problems.push(`${code}.json: no está en locales.json`);
}
if (!codes.includes(config.default)) problems.push(`locales.json: el idioma por defecto '${config.default}' no está en la lista`);

const files = codes.filter((code) => onDisk.includes(code)).map((code) => `${code}.json`);
const langs = {};
for (const file of files) {
  langs[file.replace('.json', '')] = JSON.parse(readFileSync(join(base, file), 'utf8'));
}

const keySets = files.map((f) => new Set(Object.keys(langs[f.replace('.json', '')])));
const reference = [...(keySets[0] ?? [])].sort();

keySets.forEach((keys, i) => {
  const lang = files[i];
  const missing = reference.filter((k) => !keys.has(k));
  const extra = [...keys].sort().filter((k) => !reference.includes(k));
  if (missing.length) problems.push(`${lang}: faltan keys -> ${missing.join(', ')}`);
  if (extra.length) problems.push(`${lang}: keys extra -> ${extra.join(', ')}`);
});

for (const [lang, data] of Object.entries(langs)) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${lang}: valor vacio en '${key}'`);
    }
  }
}

if (problems.length > 0) {
  console.error('check-i18n: traducciones invalidas');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`check-i18n OK: ${files.length} idiomas, ${reference.length} keys, sin valores vacios`);
