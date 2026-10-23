import { HeartHandshake, Phone, ArrowUpRight, Check } from 'lucide-react';
import { appConfig } from '../../shared/config';
export function HelpCard({ acknowledged = false, onAcknowledge }: { acknowledged?: boolean; onAcknowledge?: (message: string) => void }) {
  return <section className={`help-card ${acknowledged ? 'help-card-calm' : ''}`} aria-labelledby="safety-title" role="region">
    <div className="help-heading"><HeartHandshake size={25}/><div><p className="eyebrow">KAMU NGGAK HARUS SENDIRIAN</p><h2 id="safety-title">{acknowledged ? 'Bantuan tetap dekat, kapan kamu perlu.' : 'Cari seseorang untuk menemanimu sekarang.'}</h2></div></div>
    <p>{acknowledged ? 'Terima kasih sudah memberi kabar. Tetap dekat dengan orang yang bisa menemanimu. Kamu masih boleh cerita di sini.' : 'Kalau kamu merasa bisa melukai diri saat ini, hubungi darurat medis atau datang ke IGD terdekat. Kalau memungkinkan, dekati orang tepercaya dan jauhi hal yang bisa melukaimu.'}</p>
    <div className="help-actions"><a className="button emergency-button" href={`tel:${appConfig.contacts.emergency.phone}`}><Phone size={17}/>Darurat medis · {appConfig.contacts.emergency.label}</a><a className="button button-outline" href={appConfig.contacts.healing.url} target="_blank" rel="noopener noreferrer">Healing119<ArrowUpRight size={17}/></a></div>
    <p className="contact-note">{appConfig.contacts.healing.label} · pilih ekstensi {appConfig.contacts.healing.extension} setelah terhubung. Kontak dari brief, perlu verifikasi sebelum rilis. <a href="#/bantuan">Lihat semua bantuan</a></p>
    {onAcknowledge && <div className="ack-actions"><button onClick={() => onAcknowledge('Terima kasih sudah menghubungi seseorang. Tetap bersamanya kalau memungkinkan. Aku masih di sini untuk mendengarkan.')}><Check size={16}/>Aku sudah menghubungi seseorang</button><button onClick={() => onAcknowledge('Terima kasih sudah memberi tahu kalau kamu aman sekarang. Kita bisa pelan-pelan, sambil tetap dekat dengan orang yang bisa menemanimu.')}><Check size={16}/>Aku aman sekarang</button></div>}
  </section>;
}
