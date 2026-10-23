import { expect, it, vi, afterEach } from 'vitest';
import chat from '../api/chat';
import health from '../api/health';
afterEach(() => vi.unstubAllEnvs());
it('Vercel health reports demo without caching', async () => {
  vi.stubEnv('LLM_PROVIDER', 'demo');
  const response = health.fetch();
  expect(await response.json()).toEqual({ ok: true, demo: true });
  expect(response.headers.get('cache-control')).toBe('no-store');
});
it('Vercel chat streams safety before generation with an unavailable provider', async () => {
  vi.stubEnv('LLM_PROVIDER', 'openai');
  vi.stubEnv('LLM_API_KEY', '');
  const response = await chat.fetch(new Request('https://example.vercel.app/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' },
    body: JSON.stringify({ mode: 'listen', messages: [{ role: 'user', content: 'aku pengen mati' }] }),
  }));
  expect(response.headers.get('content-type')).toContain('text/event-stream');
  const reader = response.body!.getReader();
  expect(new TextDecoder().decode((await reader.read()).value)).toContain('"risk":"high"');
  await reader.cancel();
});
