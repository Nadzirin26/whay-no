import { ArrowRight, ArrowUpRight, Heart, Leaf, LockKeyhole, Shuffle, CloudSun, CloudRain, Flame, Compass, CircleDashed, Wind, Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { appConfig } from '../../shared/config';
import { Landscape } from '../components/Illustrations';
import { randomQuote } from '../data/quotes';

const moods = [
  { label: 'Capek', icon: CloudSun }, { label: 'Sedih', icon: CloudRain }, { label: 'Marah', icon: Flame },
  { label: 'Bingung', icon: Compass }, { label: 'Kosong', icon: CircleDashed }, { label: 'Cemas', icon: Wind }, { label: 'Nggak tau', icon: Ellipsis },
];
export function Home() {
  const [quote, setQuote] = useState(() => randomQuote());
  return <div className="home-page page-width">
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy"><p className="eyebrow"><span className="tiny-sun"/>SEBUAH JEDA, UNTUK DIRIMU</p>
        <h1 id="home-title">Di sini, kamu<br/>boleh jadi<br/><em>apa adanya.</em></h1>
        <p className="hero-description">Lagi banyak pikiran? Atau cuma butuh didengerin?<br className="desktop-break"/> Taruh dulu sedikit bebanmu. Kita cerita pelan-pelan.</p>
        <a className="button button-primary hero-button" href="#/cerita">Mulai cerita<ArrowRight size={19}/></a>
        <p className="quiet-note"><LockKeyhole size={14}/>Tanpa daftar. Tanpa harus punya semua jawabannya.</p>
      </div>
      <div className="hero-art"><div className="art-top-note">nggak perlu buru-buru.</div><Landscape/><div className="art-note"><Leaf size={22}/><p>Pelan-pelan juga<br/><em>sebuah perjalanan.</em></p></div><span className="art-caption">SEDIKIT RUANG UNTUK TUMBUH</span></div>
    </section>
    <section className="mood-section" aria-labelledby="mood-title"><div className="section-intro"><div><p className="eyebrow">MULAI DARI YANG KAMU RASA</p><h2 id="mood-title">Hari ini rasanya gimana?</h2></div><p>Nggak ada jawaban yang salah.</p></div>
      <div className="mood-list">{moods.map(({ label, icon: Icon }) => <a key={label} href={`#/cerita?mood=${encodeURIComponent(label.toLowerCase())}`} className="mood-chip"><Icon size={21} strokeWidth={1.5}/>{label}</a>)}</div>
    </section>
    <section className="home-cards" aria-label="Sedikit teman untuk harimu">
      <article className="daily-card"><div className="card-top"><span className="eyebrow"><Heart size={15}/>KATA UNTUK HARI INI</span><button className="icon-button" aria-label="Acak kata untuk hari ini" onClick={() => setQuote(randomQuote(quote.id))}><Shuffle size={18}/></button></div><blockquote>“{quote.text}”</blockquote><a className="text-link" href="#/kata">Temukan kata yang kamu butuhkan<ArrowRight size={16}/></a><span className="quote-decoration" aria-hidden="true">”</span></article>
      <a className="breathing-teaser" href="#/napas"><div><span className="eyebrow">SATU HAL KECIL DULU</span><h2>Nggak semua harus<br/>selesai sekarang.</h2><p>Ambil satu napas.<br/>Beri ruang buat dirimu.</p><span className="text-link">Napas sebentar<ArrowUpRight size={18}/></span></div><div className="teaser-rings" aria-hidden="true"><Wind size={32} strokeWidth={1.2}/></div></a>
    </section>
    <p className="home-closing"><Leaf size={17}/>{appConfig.name} hadir untuk menemani, bukan untuk menghakimi.</p>
  </div>;
}
