import { handleChat } from './chat';
import type { LLMEnv } from './providers';
// The build injects the Vite output as a static map, keeping the same backend pipeline.
declare const __ASSETS__: Record<string, { content: string; mime: string; binary: boolean }>;
export default {
  async fetch(request: Request, env: LLMEnv): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/api/health') return Response.json({ ok: true, demo: !env.LLM_PROVIDER || env.LLM_PROVIDER === 'demo' }, { headers: { 'Cache-Control': 'no-store' } });
    if (path === '/api/chat') return handleChat(request, env, request.headers.get('cf-connecting-ip') || 'unknown');
    if (path.startsWith('/api/')) return Response.json({ message: 'Halaman ini belum tersedia.' }, { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const file = __ASSETS__[path] || __ASSETS__['/index.html'];
    if (!file) return new Response('Not found', { status: 404 });
    const body = file.binary ? Uint8Array.from(atob(file.content), c => c.charCodeAt(0)) : file.content;
    return new Response(request.method === 'HEAD' ? null : body, { headers: {
      'Content-Type': file.mime, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
      'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
    } });
  },
};
