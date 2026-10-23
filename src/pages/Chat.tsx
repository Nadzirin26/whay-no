import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, CircleHelp, Leaf, LoaderCircle, LockKeyhole, MessageCircle, ShieldCheck, Trash2, Wind } from 'lucide-react';
import { appConfig, fallbackMessage, modes, type Message, type Risk } from '../../shared/config';
import { detectCrisis, maxRisk, riskRank } from '../../shared/crisis';
import { readSSE } from '../../shared/sse';
import { HelpCard } from '../components/HelpCard';
import { deleteHistory, emptyConversation, isPrivate, loadConversation, saveConversation, setPrivate, type Conversation } from '../lib/storage';

export function Chat({ mood }: { mood: string }) {
  const [conversation, setConversation] = useState<Conversation>(loadConversation);
  const [privateMode, setPrivateMode] = useState(isPrivate);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [storageProblem, setStorageProblem] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [demo, setDemo] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const threadRef = useRef<HTMLDivElement>(null);
  const safetyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);
  const showHelp = riskRank[conversation.risk] >= 2;

  useEffect(() => {
    mounted.current = true;
    const health = new AbortController();
    void fetch('/api/health', { signal: health.signal }).then(r => r.json()).then(data => { if (mounted.current) setDemo(Boolean(data.demo)); }).catch(() => {});
    return () => { mounted.current = false; requestRef.current?.abort(); health.abort(); };
  }, []);
  useEffect(() => {
    if (!saveConversation(conversation, privateMode)) setStorageProblem('Penyimpanan perangkat tidak tersedia. Percakapan ini hanya tersimpan sementara di layar.');
  }, [conversation, privateMode]);
  useEffect(() => {
    if (confirmDelete) deleteRef.current?.showModal(); else deleteRef.current?.close();
  }, [confirmDelete]);
  useEffect(() => {
    if (showHelp) safetyRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [showHelp]);
  const updateReply = (id: string, text: string, replace = false) => {
    if (!mounted.current) return;
    setConversation(c => ({ ...c, messages: c.messages.map(m => m.id === id ? { ...m, content: replace ? text : m.content + text } : m) }));
    const thread = threadRef.current;
    if (thread && thread.scrollHeight - thread.scrollTop - thread.clientHeight < 150) requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
  };
  async function send(text = input) {
    if (busy || !text.trim() || text.length > appConfig.maxInput) return;
    const context = mood && !conversation.messages.length ? `Hari ini rasanya ${mood}.\n` : '';
    const content = (context + text.trim()).slice(0, appConfig.maxInput);
    const user: Message = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    const messages = [...conversation.messages.filter(m => m.content), user];
    // The client mirrors the detector to keep help available even if the network itself is down.
    const localRisk = maxRisk(conversation.risk, detectCrisis(content));
    setConversation(c => ({ ...c, risk: localRisk, acknowledged: riskRank[localRisk] > riskRank[c.risk] ? false : c.acknowledged, messages: [...messages, { id: assistantId, role: 'assistant', content: '' }] }));
    setInput(''); setBusy(true); setProblem(''); setAnnouncement(`${appConfig.name} lagi menyimak.`);
    const controller = new AbortController(); requestRef.current = controller;
    let completed = false;
    let reply = '';
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ messages: messages.slice(-appConfig.maxContext).map(m => ({ role: m.role, content: m.content.slice(0, appConfig.maxInput) })), mode: conversation.mode }),
      });
      if (!response.ok || !response.body) throw new Error('Request unavailable');
      for await (const event of readSSE(response.body)) {
        if (!mounted.current) return;
        const data = JSON.parse(event.data);
        if (event.event === 'risk' && ['none', 'low', 'medium', 'high'].includes(data.risk)) {
          setConversation(c => ({ ...c, risk: maxRisk(c.risk, data.risk as Risk), acknowledged: riskRank[data.risk as Risk] > riskRank[c.risk] ? false : c.acknowledged }));
        }
        if (event.event === 'status') setDemo(data.demo === true);
        if (event.event === 'token') { reply += data.text; updateReply(assistantId, data.text); }
        if (event.event === 'replace') { reply = data.text; updateReply(assistantId, data.text, true); }
        if (event.event === 'error') setProblem('Sambungannya sedang sulit. Kamu bisa mencoba lagi atau membuka Bantuan.');
        if (event.event === 'done') completed = true;
      }
      if (!completed || !reply) throw new Error('Stream interrupted');
      setAnnouncement(reply);
    } catch {
      if (mounted.current) {
        updateReply(assistantId, fallbackMessage, true);
        setProblem('Sambungannya terputus. Bantuan tetap bisa kamu buka.');
        setAnnouncement(fallbackMessage);
      }
    } finally {
      clearTimeout(timeout);
      if (mounted.current) { setBusy(false); requestRef.current = null; }
    }
  }
  function clearAll() {
    requestRef.current?.abort();
    if (!deleteHistory()) setStorageProblem('Browser belum mengizinkan penghapusan. Hapus data situs melalui pengaturan browser untuk memastikan riwayat terhapus.');
    setConversation({ ...emptyConversation }); setConfirmDelete(false); setProblem(''); setInput('');
    inputRef.current?.focus();
  }
  function togglePrivate() {
    const next = !privateMode;
    if (!setPrivate(next)) setStorageProblem('Pilihan ini aktif untuk sesi ini. Browser tidak mengizinkan pembaruan penyimpanan; periksa data situs di pengaturan browser.');
    setPrivateMode(next);
  }
  const suggestions = mood && !conversation.messages.length ? [`Aku lagi ${mood}, tapi susah menjelaskannya.`, 'Aku belum tahu harus mulai dari mana.']
    : conversation.mode === 'advice' ? ['Bantu aku cari satu langkah kecil.', 'Yang paling berat buatku sekarang…']
    : conversation.mode === 'encourage' ? ['Aku butuh sedikit pengingat.', 'Rasanya aku sudah berusaha lama.']
    : ['Aku ingin cerita lebih banyak.', 'Aku belum tahu cara menjelaskannya.'];

  return <div className="chat-page page-width">
    <div className="page-heading chat-page-heading"><div><p className="eyebrow">RUANG CERITAMU</p><h1>Kita mulai pelan-pelan.</h1><p>Nggak harus rapi. Nggak harus tahu mau mulai dari mana.</p></div><a className="button button-outline" href="#/napas"><Wind size={18}/>Napas dulu sebentar</a></div>
    <div className="chat-layout"><aside className="chat-sidebar">
      <div className="sidebar-heading"><Leaf size={23}/><h2>Mau ditemani seperti apa?</h2></div><p>Kamu boleh ganti kapan saja.</p>
      <div className="mode-options" role="group" aria-label="Pilih cara ditemani">{modes.map(mode => <button key={mode.id} aria-pressed={conversation.mode === mode.id} className={`mode-option ${conversation.mode === mode.id ? 'selected' : ''}`} onClick={() => setConversation(c => ({ ...c, mode: mode.id }))}><span className="mode-radio">{conversation.mode === mode.id && <Check size={13}/>}</span><span><strong>{mode.label}</strong><small>{mode.description}</small></span></button>)}</div>
      <div className="privacy-controls"><ShieldCheck size={22}/><h3>Ceritamu, pilihanmu.</h3><p>{privateMode ? 'Pesan hanya ada di sesi ini. Pesan akan hilang saat kamu meninggalkan halaman.' : 'Riwayat disimpan di browser perangkat ini, sampai kamu menghapusnya.'}</p><label className="switch-label"><input type="checkbox" role="switch" checked={privateMode} onChange={togglePrivate}/><span className="switch-track"/><span>Mode tanpa simpan</span></label><button className="delete-button" onClick={() => setConfirmDelete(true)} disabled={busy || !conversation.messages.length}><Trash2 size={16}/>Hapus semua percakapan</button></div>
    </aside><div className="chat-main">
      {showHelp && <div ref={safetyRef} className="safety-anchor"><HelpCard acknowledged={conversation.acknowledged} onAcknowledge={text => { setConversation(c => ({ ...c, acknowledged: true, messages: [...c.messages, { id: crypto.randomUUID(), role: 'assistant', content: text }] })); setAnnouncement(text); }}/></div>}
      <section className="chat-window" aria-label="Percakapan dengan AI"><div className="chat-window-header"><div className="avatar"><Leaf size={23}/></div><div><h2>{appConfig.name}</h2><p><span className="presence-dot"/>{demo === null ? 'Teman bercerita berbasis AI' : demo ? 'Mode demo · balasan contoh' : 'Teman bercerita berbasis AI'}</p></div><LockKeyhole size={18} className="chat-header-lock"/></div>
        {demo && <p className="demo-note">Mode demo. Balasan contoh terkurasi, belum terhubung ke penyedia AI.</p>}
        <div className="chat-thread" ref={threadRef} role="log" aria-label="Isi percakapan" aria-live="off" aria-busy={busy}>
          <p className="thread-date">SEDIKIT RUANG, UNTUK KAMU</p><article className="message assistant-message"><span className="message-author">{appConfig.name} · AI</span><p>Hai. Mau cerita apa hari ini? Pelan-pelan aja, aku di sini.</p><p>Aku AI, bukan psikolog. Kamu boleh pilih dulu mau didengerin, cari saran, atau butuh semangat.</p>{mood && !conversation.messages.length && <span className="mood-context">Hari ini rasanya: {mood}</span>}</article>
          {conversation.messages.map(m => <article className={`message ${m.role === 'user' ? 'user-message' : 'assistant-message'}`} key={m.id}><span className="message-author">{m.role === 'user' ? 'Kamu' : `${appConfig.name} · AI`}</span>{m.content ? <p>{m.content}</p> : <p className="typing"><span/><span/><span/><span className="sr-only">{appConfig.name} lagi menyimak…</span></p>}</article>)}
        </div>
        <div className="composer-area">{busy ? <p className="typing-label"><LoaderCircle size={15} className="slow-spin"/>{appConfig.name} lagi menyimak…</p> : <div className="quick-replies" aria-label="Saran untuk mulai cerita">{suggestions.map(s => <button key={s} onClick={() => void send(s)}>{s}</button>)}</div>}
          <form className="composer" onSubmit={e => { e.preventDefault(); void send(); }}><label className="sr-only" htmlFor="chat-input">Ceritamu</label><textarea id="chat-input" ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={appConfig.maxInput} placeholder="Tulis yang lagi kamu rasakan…" rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} aria-describedby="input-note"/><button className="send-button" type="submit" aria-label="Kirim cerita" disabled={busy || !input.trim()}><ArrowUp size={22}/></button></form>
          <div className="composer-bottom"><p id="input-note">Enter untuk kirim · Shift + Enter untuk baris baru</p><span>{input.length}/{appConfig.maxInput}</span></div>
        </div>
      </section>
      <p className="chat-privacy"><LockKeyhole size={14}/>Saat AI aktif, pesan dikirim ke penyedia AI untuk dibalas. Server aplikasi tidak menyimpan isi percakapan. Kebijakan penyimpanan penyedia tetap berlaku.</p>
      {problem && <div role="alert" className="inline-notice"><CircleHelp size={19}/><div><p>{problem}</p><a href="#/bantuan">Buka Bantuan</a> <button onClick={() => { const last = conversation.messages.filter(m => m.role === 'user').at(-1); if (last) void send(last.content); }} disabled={busy}>Coba kirim lagi</button></div></div>}
      {storageProblem && <p className="inline-notice" role="status">{storageProblem}</p>}
    </div></div>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    <dialog ref={deleteRef} className="confirm-dialog" onCancel={() => setConfirmDelete(false)} onClick={e => { if (e.target === deleteRef.current) setConfirmDelete(false); }}><MessageCircle size={27}/><h2>Hapus percakapan di perangkat ini?</h2><p>Semua pesan di ruang cerita ini akan dihapus. Kata favoritmu tetap tersimpan.</p><div className="dialog-actions"><button className="button button-outline" autoFocus onClick={() => setConfirmDelete(false)}>Simpan dulu</button><button className="button emergency-button" onClick={clearAll}>Ya, hapus percakapan</button></div></dialog>
  </div>;
}
