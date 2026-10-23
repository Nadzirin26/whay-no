import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { handleChat } from './chat';

const app = express();
app.disable('x-powered-by');
const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
app.set('trust proxy', Number.isInteger(hops) && hops >= 0 ? hops : 0);
app.use(helmet({ contentSecurityPolicy: { directives: { 'script-src': ["'self'"], 'style-src': ["'self'", "'unsafe-inline'"], 'font-src': ["'self'"], 'img-src': ["'self'", 'data:', 'blob:'], 'connect-src': ["'self'"], 'upgrade-insecure-requests': null } } }));
app.get('/api/health', (_req, res) => res.set('Cache-Control', 'no-store').json({ ok: true, demo: !process.env.LLM_PROVIDER || process.env.LLM_PROVIDER === 'demo' }));
app.all('/api/chat', async (req, res) => {
  const controller = new AbortController();
  res.on('close', () => controller.abort());
  try {
    const request = new Request('http://localhost/api/chat', {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] || '' },
      ...(req.method === 'POST' ? { body: Readable.toWeb(req) as ReadableStream<Uint8Array>, duplex: 'half' } : {}),
      signal: controller.signal,
    } as RequestInit);
    const response = await handleChat(request, process.env, req.ip || 'unknown');
    res.status(response.status); response.headers.forEach((value, key) => res.setHeader(key, value));
    res.flushHeaders();
    if (response.body) {
      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        if (res.destroyed) break;
        if (!res.write(chunk)) await new Promise<void>(resolve => { res.once('drain', resolve); res.once('close', resolve); });
      }
    }
    res.end();
  } catch {
    if (!res.headersSent) res.status(500).json({ message: 'Aku lagi susah merespons. Halaman Bantuan tetap bisa kamu buka.' });
    else res.end();
  }
});
app.use('/api', (_req, res) => res.status(404).json({ message: 'Halaman bantuan tetap bisa kamu buka.' }));
app.use(express.static(resolve('dist/client'), { etag: true }));
app.get('/{*path}', (_req, res) => res.sendFile(resolve('dist/client/index.html')));
app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => { console.log('Teduh API: http://127.0.0.1:' + (process.env.PORT || 3001)); });
