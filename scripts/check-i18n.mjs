import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'lang');
const files = ['en.json', 'es.json', 'ja.json'];

const langs = {};
for (const file of files) {
  langs[file.replace('.json', '')] = JSON.parse(readFileSync(join(base, file), 'utf8'));
}

const keySets = files.map((f) => new Set(Object.keys(langs[f.replace('.json', '')])));
const reference = [...keySets[0]].sort();
const problems = [];

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