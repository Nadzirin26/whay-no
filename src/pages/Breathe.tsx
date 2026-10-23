import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Leaf, Pause, Play, RotateCcw } from 'lucide-react';
const stages = [
  { label: 'Lihat sekitarmu', count: 5, sense: 'hal yang bisa kamu lihat', text: 'Bentuk meja, warna dinding, atau cahaya di lantai. Sebutkan dalam hati, satu-satu.' },
  { label: 'Rasakan tempatmu berada', count: 4, sense: 'hal yang bisa kamu rasakan', text: 'Kaki yang menapak, kain pakaian, atau sandaran kursi. Pilih sentuhan yang nyaman.' },
  { label: 'Dengarkan sejenak', count: 3, sense: 'suara yang bisa kamu dengar', text: 'Suara dari dekat atau jauh. Tidak perlu mencari suasana yang benar-benar sunyi.' },
  { label: 'Kenali aroma di dekatmu', count: 2, sense: 'aroma yang bisa kamu kenali', text: 'Mungkin aroma ruangan atau pakaianmu. Kalau tidak ada, bayangkan aroma yang terasa nyaman.' },
  { label: 'Sadari satu rasa', count: 1, sense: 'rasa yang bisa kamu sadari', text: 'Perhatikan rasa netral di mulut, atau ingat rasa makanan yang kamu sukai. Tidak perlu memaksakan apa pun.' },
];
export function Breathe() {
  const [tab, setTab] = useState<'breathe' | 'ground'>('breathe');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [step, setStep] = useState(0);
  const [groundDone, setGroundDone] = useState(false);
  const cycle = elapsed % 14;
  const phase = cycle < 4 ? 'Tarik napas' : cycle < 8 ? 'Tahan lembut' : 'Hembuskan';
  const count = cycle < 4 ? 4 - cycle : cycle < 8 ? 8 - cycle : 14 - cycle;
  const finished = elapsed >= 56;
  useEffect(() => {
    if (!running || finished) return;
    const timer = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [running, finished]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  function selectTab(next: 'breathe' | 'ground') { setTab(next); setRunning(false); }
  return <div className="breathe-page page-width"><div className="page-heading centered"><p className="eyebrow">KEMBALI KE SAAT INI</p><h1>Untuk sebentar, cukup bernapas.</h1><p>Nggak ada yang harus kamu selesaikan di menit ini.</p></div>
    <div className="segmented-control" role="group" aria-label="Pilih latihan"><button aria-pressed={tab === 'breathe'} className={tab === 'breathe' ? 'active' : ''} onClick={() => selectTab('breathe')}>Napas 4–4–6</button><button aria-pressed={tab === 'ground'} className={tab === 'ground' ? 'active' : ''} onClick={() => selectTab('ground')}>Grounding 5–4–3–2–1</button></div>
    {tab === 'breathe' ? <section className="breathe-exercise" aria-label="Latihan napas empat empat enam"><p className="exercise-instruction">Tarik 4 detik. Tahan 4 detik. Hembuskan 6 detik.</p><div className={`breathing-orbit ${running && !finished ? 'is-running' : ''} ${cycle < 4 ? 'inhale' : cycle < 8 ? 'hold' : 'exhale'}`}><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="breath-circle"><Leaf size={31} strokeWidth={1.2}/><h2>{finished ? 'Terima kasih, sudah jeda.' : running ? phase : elapsed > 0 ? 'Jeda sebentar.' : 'Satu napas dulu.'}</h2><span className="breath-count" aria-hidden="true">{running && !finished ? count : finished ? <Check size={30}/> : '4 · 4 · 6'}</span><p>{finished ? 'Kamu boleh lanjut dengan ritmemu.' : running ? 'Pelan-pelan, sesuai nyamannya.' : 'Ikuti ritme yang nyaman untukmu.'}</p></div></div>
      <div className="cycle-dots" role="img" aria-label={`Putaran ${Math.min(Math.floor(elapsed / 14) + 1, 4)} dari 4`}>{[0, 1, 2, 3].map(i => <span key={i} className={elapsed >= (i + 1) * 14 ? 'done' : Math.floor(elapsed / 14) === i ? 'current' : ''}/>)}</div>
      <div className="breath-actions"><button className="button button-primary" onClick={() => { if (finished) { setElapsed(0); setRunning(true); } else setRunning(r => !r); }}>{running && !finished ? <Pause size={18}/> : <Play size={18}/>} {finished ? 'Mulai lagi' : running ? 'Jeda latihan' : elapsed > 0 ? 'Lanjutkan' : 'Mulai bernapas'}</button><button className="icon-button" aria-label="Ulangi latihan dari awal" onClick={() => { setRunning(false); setElapsed(0); }}><RotateCcw size={20}/></button></div><p className="exercise-note">Empat putaran · sekitar satu menit<br/>Kalau pusing atau tidak nyaman, berhenti dan bernapas biasa. Kamu boleh melewati bagian menahan napas.</p>
      <p className="sr-only" role="status" aria-live="polite">{finished ? 'Latihan selesai.' : running ? phase : 'Latihan dijeda.'}</p>
    </section> : <section className="grounding-exercise" aria-label="Grounding lima empat tiga dua satu">{groundDone ? <div className="ground-card"><Check size={38}/><p className="eyebrow">KAMU SUDAH MEMBERI DIRIMU JEDA</p><h2>Kembali, sedikit demi sedikit.</h2><p>Perhatikan tempat kamu berada sekarang. Kamu boleh mengulang latihan atau mencari orang untuk menemanimu.</p><button className="button button-primary" onClick={() => { setStep(0); setGroundDone(false); }}>Ulangi pelan-pelan</button></div> : <div className="ground-card"><div className="ground-progress">{stages.map((s, i) => <span key={s.count} className={i === step ? 'active' : i < step ? 'completed' : ''}>{s.count}</span>)}</div><p className="eyebrow">LANGKAH {step + 1} DARI 5</p><span className="ground-number" aria-hidden="true">{stages[step].count}</span><h2>{stages[step].label}</h2><h3>{stages[step].count} {stages[step].sense}</h3><p>{stages[step].text}</p><div className="ground-navigation"><button className="button button-outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ArrowLeft size={17}/>Kembali</button><button className="button button-primary" onClick={() => step === 4 ? setGroundDone(true) : setStep(s => s + 1)}>{step === 4 ? 'Selesai' : 'Lanjutkan'}<ArrowRight size={17}/></button></div></div>}<p className="exercise-note">Tidak perlu sempurna. Kamu boleh melewati indra yang sulit diakses.</p><p className="sr-only" role="status">{groundDone ? 'Latihan grounding selesai.' : `${stages[step].label}. ${stages[step].count} ${stages[step].sense}. ${stages[step].text}`}</p></section>}
    <a className="text-link back-to-chat" href="#/cerita"><ArrowLeft size={17}/>Kembali ke ruang cerita</a>
  </div>;
}
