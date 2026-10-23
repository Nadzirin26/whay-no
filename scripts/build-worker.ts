import { build } from 'esbuild';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
const root = 'dist/client';
const assets: Record<string, { content: string; mime: string; binary: boolean }> = {};
const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' };
async function walk(path: string) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = join(path, entry.name);
    if (entry.isDirectory()) await walk(file);
    else {
      const ext = extname(file); const binary = ['.woff2', '.woff', '.png'].includes(ext);
      assets['/' + relative(root, file).replaceAll('\\', '/')] = { content: (await readFile(file)).toString(binary ? 'base64' : 'utf8'), mime: mime[ext] || 'application/octet-stream', binary };
    }
  }
}
await walk(root);
await mkdir('dist/server', { recursive: true });
await build({ entryPoints: ['server/worker.ts'], outfile: 'dist/server/index.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, define: { __ASSETS__: JSON.stringify(assets) } });
// Preserve the manifest when present; credentials never belong here.
try { const config = await readFile('.openai/hosting.json', 'utf8'); await mkdir('dist/.openai', { recursive: true }); await writeFile('dist/.openai/hosting.json', config); } catch { /* Local build does not need a Site identity. */ }
console.log('Built Vite client and serverless Worker. No API key is bundled.');
