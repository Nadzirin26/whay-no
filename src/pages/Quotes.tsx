import { useState } from 'react';
import { ArrowDownToLine, Heart, Leaf, Share2, Shuffle } from 'lucide-react';
import { categories, quotes, type Category, type Quote } from '../data/quotes';
import { loadFavorites, saveFavorites } from '../lib/storage';
import { shareQuote } from '../lib/share';
export function Quotes() {
  const [category, setCategory] = useState<Category | 'Semua' | 'Favorit'>('Semua');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [order, setOrder] = useState(() => quotes.map(q => q.id));
  const [notice, setNotice] = useState('');
  const [sharing, setSharing] = useState<string | null>(null);
  function favorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next); if (!saveFavorites(next)) setNotice('Favorit hanya tersimpan selama halaman ini terbuka. Penyimpanan browser tidak tersedia.');
  }
  async function share(quote: Quote) {
    setSharing(quote.id); setNotice('');
    try { setNotice(await shareQuote(quote.text) === 'shared' ? 'Gambar berhasil dibagikan.' : 'Gambar PNG diunduh. Kamu bisa membagikannya kapan saja.'); }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setNotice('Gambar belum bisa dibagikan. Kamu boleh mencoba lagi.'); }
    finally { setSharing(null); }
  }
  const visible = order.map(id => quotes.find(q => q.id === id)!).filter(q => category === 'Semua' || (category === 'Favorit' ? favorites.includes(q.id) : q.category === category));
  return <div className="quotes-page page-width"><div className="page-heading"><p className="eyebrow">PENGINGAT KECIL UNTUK HARI YANG BESAR</p><h1>Kata yang bisa kamu bawa pulang.</h1><p>Nggak harus mengubah harimu. Mungkin cukup menemani sebentar.</p></div>
    <div className="quote-toolbar"><div className="filter-list" role="group" aria-label="Kelompok kata penyemangat">{(['Semua', ...categories, 'Favorit'] as const).map(c => <button key={c} aria-pressed={category === c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c === 'Favorit' && <Heart size={15}/>} {c}{c === 'Favorit' && ` (${favorites.length})`}</button>)}</div><button className="button button-outline shuffle-button" onClick={() => { setOrder(o => [...o].map(id => ({ id, n: Math.random() })).sort((a, b) => a.n - b.n).map(v => v.id)); setNotice('Urutan kata sudah diacak.'); }}><Shuffle size={17}/>Acak kata</button></div>
    {category === 'Mau menyerah' && <aside className="gentle-help"><Leaf size={21}/><p>Kalau kamu merasa tidak aman, cari orang yang bisa menemanimu sekarang. <a href="#/bantuan">Bantuan ada di sini.</a></p></aside>}
    <p className="sr-only" role="status">{visible.length} kata ditampilkan.</p>
    {notice && <p role="status" className="inline-notice"><ArrowDownToLine size={17}/>{notice}</p>}
    <div className="quote-grid">{visible.map((q, i) => <article className={`quote-card quote-tone-${i % 3}`} key={q.id}><div className="card-top"><span className="eyebrow">{q.category}</span><Leaf size={20} strokeWidth={1.3}/></div><blockquote>“{q.text}”</blockquote><div className="quote-card-actions"><button aria-label={`${favorites.includes(q.id) ? 'Hapus dari' : 'Simpan ke'} favorit: ${q.text}`} aria-pressed={favorites.includes(q.id)} className={favorites.includes(q.id) ? 'favorited' : ''} onClick={() => favorite(q.id)}><Heart size={18} fill={favorites.includes(q.id) ? 'currentColor' : 'none'}/>{favorites.includes(q.id) ? 'Tersimpan' : 'Simpan'}</button><button onClick={() => void share(q)} disabled={sharing !== null} aria-label={`Bagikan sebagai gambar: ${q.text}`}><Share2 size={17}/>{sharing === q.id ? 'Menyiapkan…' : 'Bagikan'}</button></div></article>)}</div>
    {!visible.length && <div className="empty-state"><Heart size={35} strokeWidth={1.2}/><h2>Simpan kata yang terasa dekat.</h2><p>Ketuk “Simpan” pada kata yang ingin kamu temukan lagi nanti.</p><button className="button button-primary" onClick={() => setCategory('Semua')}>Lihat semua kata</button></div>}
    <p className="quiet-center">60 pengingat original, ditulis untuk menemani. Favorit tersimpan hanya di perangkat ini.</p>
  </div>;
}
