import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
const chromePath = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const chrome = await launch({ chromePath, chromeFlags: ['--headless', '--no-first-run', '--disable-gpu'] });
await mkdir('reports', { recursive: true });
let failed = false;
try {
  for (const path of ['/', '/cerita', '/kata', '/napas', '/bantuan']) {
    const url = `${process.env.AUDIT_URL || 'http://127.0.0.1:5173'}/#${path}`;
    const result = await lighthouse(url, { port: chrome.port, onlyCategories: ['accessibility'], output: 'html', logLevel: 'error', formFactor: 'mobile', screenEmulation: { mobile: true, width: 360, height: 800, deviceScaleFactor: 1, disabled: false } });
    const name = path === '/' ? 'beranda' : path.slice(1);
    const score = Math.round(result.lhr.categories.accessibility.score * 100);
    console.log(`${name}: ${score}/100`);
    await writeFile(`reports/accessibility-${name}.html`, result.report);
    await writeFile(`reports/accessibility-${name}.json`, JSON.stringify(result.lhr, null, 2));
    if (score <= 90) failed = true;
  }
} finally { await chrome.kill(); }
if (failed) process.exitCode = 1;
