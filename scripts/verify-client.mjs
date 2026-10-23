import { readdir, readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
const files = (await readdir('dist/client/assets')).filter(f => f.endsWith('.js'));
assert(files.length > 0, 'Build the client first.');
for (const file of files) {
  const code = await readFile(`dist/client/assets/${file}`, 'utf8');
  for (const token of ['LLM_API_KEY', 'SYSTEM_PROMPT', 'PROTOKOL KRISIS (aturan operasional)', 'teduh-build-secret-sentinel']) assert(!code.includes(token), `Server-only data found in ${file}`);
  if (process.env.LLM_API_KEY) assert(!code.includes(process.env.LLM_API_KEY), `An API key was found in ${file}`);
}
console.log('Client bundle: no provider API key, system prompt, or server-only configuration.');
