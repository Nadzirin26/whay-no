import { appConfig, fallbackMessage, type Message, type Mode, type Risk } from '../shared/config';
import { detectCrisis, maxRisk, riskRank } from '../shared/crisis';
import { createProvider, type LLMEnv, type Provider } from './providers';
import { crisisReply } from './safety';

export class RateLimiter {
  private entries = new Map<string, { count: number; reset: number }>();
  constructor(private limit = 20, private windowMs = 60_000) {}
  allow(ip: string, now = Date.now()): boolean {
    for (const [key, entry] of this.entries) if (entry.reset <= now) this.entries.delete(key);
    let entry = this.entries.get(ip);
    if (!entry) {
      if (this.entries.size >= 5000) return false;
      entry = { count: 0, reset: now + this.windowMs }; this.entries.set(ip, entry);
    }
    return ++entry.count <= this.limit;
  }
}
const limiter = new RateLimiter();
// Intentional control-code removal: preserve tabs and newlines in plain text.
// eslint-disable-next-line no-control-regex
export const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim();
function validate(body: unknown): { messages: Message[]; mode: Mode } {
  if (!body || typeof body !== 'object') throw new Error('Pesan belum terbaca. Coba kirim lagi, ya.');
  const { messages, mode } = body as Record<string, unknown>;
  if (!['listen', 'advice', 'encourage'].includes(mode as string)) throw new Error('Pilih cara aku menemanimu dulu, ya.');
  if (!Array.isArray(messages) || !messages.length || messages.length > 100) throw new Error('Percakapannya belum terbaca. Coba kirim pesan singkat, ya.');
  const cleaned = messages.slice(-appConfig.maxContext).map((message: unknown, i: number) => {
    if (!message || typeof message !== 'object') throw new Error('Format pesan belum terbaca.');
    const { role, content } = message as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || content.length > appConfig.maxInput) throw new Error(`Pesan maksimal ${appConfig.maxInput} karakter, ya.`);
    const clean = sanitize(content);
    if (!clean) throw new Error('Tulis sedikit ceritamu sebelum mengirim, ya.');
    return { id: String(i), role, content: clean } as Message;
  });
  if (cleaned.at(-1)?.role !== 'user') throw new Error('Pesan terakhir perlu berasal darimu.');
  return { messages: cleaned, mode: mode as Mode };
}
export const streamHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform',
  'X-Accel-Buffering': 'no', 'X-Content-Type-Options': 'nosniff',
};
type Dependencies = { provider?: Provider; limiter?: RateLimiter };
export async function handleChat(request: Request, env: LLMEnv, ip: string, deps: Dependencies = {}): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ message: 'Gunakan POST untuk mengirim cerita.' }, { status: 405, headers: { Allow: 'POST' } });
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ message: 'Pesan perlu dikirim sebagai JSON.' }, { status: 415 });
  let input: ReturnType<typeof validate>;
  try {
    // Enforce length even when Content-Length is absent or spoofed. Never log input.
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Pesan belum terbaca.');
    const decoder = new TextDecoder(); let raw = ''; let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 96_000) { await reader.cancel(); throw new Error('Percakapannya terlalu panjang. Coba pesan yang lebih singkat, ya.'); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    } finally { reader.releaseLock(); }
    input = validate(JSON.parse(raw));
  } catch { return Response.json({ message: 'Pesan belum terbaca. Gunakan maksimal 2.000 karakter dan coba lagi, ya.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }

  // Deterministic detection is completed before rate limit, classification, or generation.
  let risk = input.messages.filter(m => m.role === 'user').reduce<Risk>((r, m) => maxRisk(r, detectCrisis(m.content)), 'none');
  const allowed = (deps.limiter || limiter).allow(ip);
  const provider = deps.provider || createProvider(env);
  const encoder = new TextEncoder();
  const abort = new AbortController();
  request.signal.addEventListener('abort', () => abort.abort(), { once: true });
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (!abort.signal.aborted) controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        send('risk', { risk });
        send('status', { demo: provider.demo, limited: !allowed });
        if (!allowed) {
          send('replace', { text: riskRank[risk] >= 2 ? crisisReply(risk) : 'Kamu sudah mengirim cukup banyak cerita dalam waktu singkat. Ambil jeda sebentar, lalu coba lagi dalam satu menit. Kamu tetap bisa membuka Bantuan sekarang.' });
          send('done', { limited: true }); return;
        }
        // Clear crises do not wait for any external service. No free-form generation for medium/high.
        if (riskRank[risk] < 2) {
          try {
            const classified = await provider.classify(input.messages, AbortSignal.any([abort.signal, AbortSignal.timeout(6000)]));
            risk = maxRisk(risk, classified);
            send('risk', { risk });
          } catch {
            // Fail conservatively on ambiguous deterministic signals.
            if (risk === 'low') { risk = 'medium'; send('risk', { risk }); }
          }
        }
        if (riskRank[risk] >= 2) {
          for (const text of crisisReply(risk).match(/.{1,18}/gu) || []) {
            if (abort.signal.aborted) break;
            send('token', { text });
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        } else {
          let generated = false;
          for await (const token of provider.stream(input.messages, input.mode, AbortSignal.any([abort.signal, AbortSignal.timeout(40_000)]))) {
            if (abort.signal.aborted) break;
            generated = true; send('token', { text: token });
          }
          if (!generated && !abort.signal.aborted) throw new Error('Empty provider reply');
        }
        send('done', {});
      } catch {
        send('replace', { text: riskRank[risk] >= 2 ? crisisReply(risk) : fallbackMessage });
        send('error', { message: 'provider_unavailable' });
        send('done', {});
      } finally {
        try { controller.close(); } catch { /* The browser may already have canceled its reader. */ }
      }
    },
    cancel() { abort.abort(); },
  });
  return new Response(stream, { headers: streamHeaders });
}
