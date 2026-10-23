import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, HeartHandshake, Leaf, Moon, Sun } from 'lucide-react';
import { appConfig } from '../shared/config';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Quotes } from './pages/Quotes';
import { Breathe } from './pages/Breathe';
import { Help } from './pages/Help';
import { loadTheme, saveTheme } from './lib/storage';

const navigation = [ ['/', 'Beranda'], ['/cerita', 'Ruang cerita'], ['/kata', 'Kata penyemangat'], ['/napas', 'Napas sebentar'] ];
function currentRoute() { const [path, query] = (window.location.hash.slice(1) || '/').split('?'); return { path, mood: new URLSearchParams(query).get('mood')?.slice(0, 30) || '' }; }
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="error-state page-width"><Leaf size={38}/><h1>Kita jeda sebentar, ya.</h1><p>Halaman ini sedang sulit dibuka. Kamu tetap bisa mengakses bantuan.</p><a className="button button-primary" href="#/bantuan" onClick={() => this.setState({ failed: false })}>Buka Bantuan</a><button className="button button-outline" onClick={() => window.location.reload()}>Muat ulang</button></div> : this.props.children; }
}
export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [night, setNight] = useState(loadTheme);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const changed = () => { setRoute(currentRoute()); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true })); };
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = night ? 'night' : 'day'; saveTheme(night); }, [night]);
  useEffect(() => {
    const name = navigation.find(n => n[0] === route.path)?.[1] || (route.path === '/bantuan' ? 'Bantuan' : 'Ruang untuk merasa');
    document.title = `${appConfig.name} — ${name}`;
  }, [route.path]);
  let page: ReactNode;
  switch (route.path) {
    case '/': page = <Home/>; break;
    case '/cerita': page = <Chat key={route.mood} mood={route.mood}/>; break;
    case '/kata': page = <Quotes/>; break;
    case '/napas': page = <Breathe/>; break;
    case '/bantuan': page = <Help/>; break;
    default: page = <div className="error-state page-width"><Leaf size={35}/><h1>Jalannya belum sampai sini.</h1><p>Kita kembali ke tempat yang lebih familiar, ya.</p><a href="#/" className="button button-primary"><ArrowLeft size={17}/>Kembali ke beranda</a></div>;
  }
  return <><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); mainRef.current?.focus(); }}>Langsung ke isi halaman</a>
    <header className="site-header"><div className="header-inner page-width"><a href="#/" className="brand" aria-label={`${appConfig.name}, beranda`}><Leaf size={30} strokeWidth={1.45}/><span>{appConfig.name.toLowerCase()}<span className="brand-period">.</span></span></a><nav className="main-nav" aria-label="Navigasi utama">{navigation.map(([path, label]) => <a key={path} href={`#${path}`} aria-current={route.path === path ? 'page' : undefined}>{label}</a>)}</nav><div className="header-actions"><button className="icon-button theme-toggle" aria-label={night ? 'Aktifkan mode siang' : 'Aktifkan mode malam'} aria-pressed={night} onClick={() => setNight(v => !v)}>{night ? <Sun size={19}/> : <Moon size={19}/>}</button><a className="help-link" href="#/bantuan" aria-current={route.path === '/bantuan' ? 'page' : undefined}><HeartHandshake size={18}/><span>Butuh bantuan sekarang?</span></a></div></div><nav className="mobile-nav" aria-label="Navigasi halaman">{navigation.map(([path, label], i) => <a key={path} href={`#${path}`} aria-label={label} aria-current={route.path === path ? 'page' : undefined}>{['Beranda', 'Cerita', 'Kata', 'Napas'][i]}</a>)}</nav></header>
    <main id="main-content" tabIndex={-1} ref={mainRef}><ErrorBoundary key={route.path}>{page}</ErrorBoundary></main>
    <footer className="site-footer"><div className="page-width footer-inner"><a href="#/" className="brand footer-brand" aria-label={`${appConfig.name}, beranda`}><Leaf size={20} strokeWidth={1.5}/><span>{appConfig.name.toLowerCase()}.</span></a><p>{appConfig.name} adalah teman bercerita berbasis AI, bukan pengganti psikolog atau psikiater.</p><span className="footer-signoff">Satu hari, satu langkah.</span></div></footer>
  </>;
}
