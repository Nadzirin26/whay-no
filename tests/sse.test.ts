import { expect, it } from 'vitest';
import { readSSE } from '../shared/sse';
it('menggabungkan UTF-8 terbelah, CRLF, dan frame SSE terpotong', async () => {
  const bytes = new TextEncoder().encode('event: token\r\ndata: {"text":"pelan-pelan café"}\r\n\r\nevent: done\ndata: {}\n\n');
  const stream = new ReadableStream<Uint8Array>({ start(c) { for (let i = 0; i < bytes.length; i++) c.enqueue(bytes.slice(i, i + 1)); c.close(); } });
  const events = []; for await (const event of readSSE(stream)) events.push(event);
  expect(events).toEqual([{ event: 'token', data: '{"text":"pelan-pelan café"}' }, { event: 'done', data: '{}' }]);
});
