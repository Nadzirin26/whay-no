/** Satu sumber nama dan kontak. Kontak berasal dari brief: verifikasi sebelum rilis. */
export const appConfig = {
  name: 'Teduh',
  tagline: 'Ruang untuk merasa.',
  maxInput: 2000,
  maxContext: 20,
  contacts: {
    // verifikasi sebelum rilis: nomor, ekstensi, biaya, jam, wilayah, dan ketersediaan.
    healing: { name: 'Healing119 · Kemenkes', phone: '119', extension: '8', label: '119 ekstensi 8', url: 'https://healing119.id', cost: 'Gratis menurut informasi di brief; perlu verifikasi.' },
    emergency: { name: 'Darurat medis', phone: '119', label: '119' },
    violence: { name: 'SAPA 129 · KemenPPPA', phone: '129', label: '129', url: 'https://laporsapa129.kemenpppa.go.id' },
  },
} as const;
export const modes = [
  { id: 'listen', label: 'Aku cuma mau didengerin', short: 'Didengerin', description: 'Nggak perlu solusi dulu. Cerita aja.' },
  { id: 'advice', label: 'Aku butuh saran', short: 'Butuh saran', description: 'Kita cari satu langkah kecil bersama.' },
  { id: 'encourage', label: 'Kasih aku semangat', short: 'Butuh semangat', description: 'Sedikit pengingat yang menguatkan.' },
] as const;
export type Mode = typeof modes[number]['id'];
export type Risk = 'none' | 'low' | 'medium' | 'high';
export type Message = { id: string; role: 'user' | 'assistant'; content: string };
export const fallbackMessage = 'Maaf, aku lagi susah merespons. Tapi aku tetap di sini. Kamu bisa coba kirim lagi, atau buka halaman Bantuan.';
