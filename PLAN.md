# Rencana Teduh

1. Fondasi React, Vite, TypeScript, Tailwind; konfigurasi tunggal, font lokal, navigasi aksesibel, palet hangat dan mode malam.
2. Lima halaman: Beranda, Cerita, Kata Penyemangat, Napas Sebentar, Bantuan. Mobile-first, tanpa akun.
3. API streaming `/api/chat`: adapter demo / OpenAI / OpenAI-compatible, validasi, 20 pesan, rate limit, kunci hanya di server. Riwayat lokal dengan pilihan tanpa simpan.
4. Deteksi deterministik sebelum provider; klasifikasi LLM menambah risiko, tidak menurunkannya. Kartu bantuan persisten dan respons krisis terkurasi, termasuk saat provider gagal.
5. 60 kutipan original, favorit, ekspor PNG; napas 4-4-6 dan grounding. Lint, build, tes keamanan/API/privasi, pemeriksaan browser 360px dan Lighthouse.

## Struktur
```
src/                 # React, komponen, halaman, CSS, browser storage
shared/              # konfigurasi, tipe, detektor lokal yang juga dipakai server
server/
  prompts/system.ts  # prompt asli dari brief, tidak diimpor klien
  providers/         # adapter dan parser streaming provider
  chat.ts            # pipeline validasi, risiko, SSE, fallback
  index.ts           # Express untuk dev / hosting Node
  worker.ts          # adapter Request untuk hosting serverless
scripts/             # build serverless dan audit aksesibilitas
tests/               # detektor, API, parser, privasi
```
