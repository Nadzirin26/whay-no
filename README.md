# Teduh

Ruang bercerita berbahasa Indonesia. Mendengarkan dulu, memberi ruang pada perasaan, dan menawarkan langkah kecil ketika diminta. Dibuat dengan React, Vite, TypeScript, Tailwind, serta API Express / serverless. Tanpa akun dan tanpa database.

## Menjalankan

Gunakan Node.js 22+ (diverifikasi pada Node 24) dan npm.

```powershell
cd D:\magang\project\iseng\teduh
npm ci
Copy-Item .env.example .env
npm run dev
```

Buka `http://127.0.0.1:5173`. API berjalan pada `http://127.0.0.1:3001`; Vite meneruskan `/api` ke Express. Port 5173 dibuat tetap. Jika port terpakai, hentikan proses aplikasi yang sesuai atau ubah `vite.config.ts`.

Mode awal adalah **demo**: balasan contoh terkurasi yang dikirim bertahap melalui SSE, bukan jawaban LLM sungguhan. Label demo terlihat di chat. Mode ini tidak mengirim pesan ke penyedia AI. Tidak ada API key yang dibuat atau diminta di browser.

Untuk produksi Node:

```powershell
npm run build
npm start
```

Express melayani hasil Vite dan API pada port 3001, terikat ke loopback. Pasang reverse proxy HTTPS di depannya untuk hosting. Build juga menghasilkan `dist/server/index.js`, Worker ESM mandiri yang melayani aset dan pipeline API yang sama untuk hosting serverless Sites. Jangan menyajikan direktori `dist/server` sebagai aset publik.

## Konfigurasi AI

Isi `.env` hanya di server. Jangan gunakan awalan `VITE_` untuk rahasia.

| Variabel | Nilai / fungsi |
| --- | --- |
| `LLM_PROVIDER` | `demo` (default), `openai`, atau `openai-compatible` |
| `LLM_MODEL` | ID model yang mendukung Chat Completions streaming dan JSON untuk klasifikasi; contoh `gpt-4.1-mini` |
| `LLM_API_KEY` | Kunci penyedia; wajib untuk provider sungguhan |
| `LLM_BASE_URL` | Untuk `openai-compatible`, endpoint HTTPS tepercaya sampai `/v1`; default contoh `https://api.openai.com/v1` |
| `PORT` | Port Express, default `3001` |
| `TRUST_PROXY_HOPS` | Jumlah hop reverse proxy tepercaya, default `0`; jangan isi `true` |
| `CHROME_PATH` | Opsional: path Chrome/Edge untuk Lighthouse |
| `AUDIT_URL` | Opsional: origin yang diaudit, default `http://127.0.0.1:5173` |

Contoh koneksi AI: ubah `LLM_PROVIDER=openai`, isi model dan kunci, lalu restart API. Kunci tidak tersedia dalam percakapan ini; pengujian terhadap penyedia sungguhan perlu dilakukan setelah kunci dipasang. Adapter menggunakan [format SSE Chat Completions resmi](https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events).

Hosting Sites menggunakan environment runtime dari pengaturan Site, bukan `.env` yang diunggah. Pratinjau privat memakai demo sampai operator memasang kunci. `.env`, cache npm, laporan, dan artefak build dikecualikan dari Git.

## Halaman

- **Beranda:** mulai tanpa login, tujuh pilihan suasana, kata acak, dan jalan ke latihan napas.
- **Ruang cerita:** tiga mode yang bisa diubah, respons streaming, saran lanjutan, bantuan tetap di header, riwayat lokal, hapus percakapan, dan mode tanpa simpan.
- **Kata penyemangat:** 60 kalimat original dalam enam kategori, acak, favorit lokal, dan bagikan sebagai PNG. Jika berbagi file tidak didukung, PNG diunduh. Berbagi hanya dilakukan setelah pengguna menekan tombol.
- **Napas sebentar:** empat putaran napas 4–4–6, jeda/ulang, pause saat tab tidak aktif, serta grounding 5–4–3–2–1. Boleh melewati indra atau tahap yang tidak nyaman.
- **Bantuan:** kontak terpusat, ajakan mencari pendamping manusia, dan pilihan pertolongan langsung.

Nama aplikasi dan seluruh nomor bantuan berada di **`shared/config.ts`**. Ubah `appConfig.name` untuk mengganti merek UI dan nama yang diberikan ke provider. Prompt asli di `server/prompts/system.ts` dipertahankan apa adanya sesuai brief; nama aktual dan aturan operasional ditambahkan terpisah oleh `server/safety.ts`.

## Privasi dan batas penyimpanan

- Isi percakapan tidak disimpan atau dicatat oleh server aplikasi. Tidak ada analytics, cookie pelacakan, font eksternal, atau layanan gambar eksternal. Log aplikasi hanya memuat informasi startup, tidak memuat body/error penyedia.
- Saat provider sungguhan aktif, hingga 20 pesan terakhir dikirim ke penyedia untuk klasifikasi dan jawaban. `store: false` dikirim, tetapi kebijakan retensi/log penyedia tetap berlaku. Tidak ada janji bahwa penyedia tidak menyimpan data.
- Normalnya, maksimal 100 pesan disimpan di `localStorage` perangkat. Browser bersama berarti pengguna perangkat lain bisa membacanya. Menghapus data situs atau memakai browser berbeda menghilangkan riwayat.
- **Mode tanpa simpan** menghapus riwayat lama dari penyimpanan dan mempertahankan pesan baru hanya dalam memori halaman chat. Pesan hilang saat reload, menutup tab, atau meninggalkan halaman chat. Preferensi mode tetap disimpan; favorit kutipan terpisah dari percakapan.
- Tombol **Hapus semua percakapan** meminta konfirmasi lalu menghapus riwayat lokal dan pesan di layar. Favorit tidak ikut terhapus. Ini tidak menghapus data yang mungkin sudah diterima penyedia.
- Jika `localStorage` ditolak/penuh/rusak, halaman tetap berfungsi; pengguna diberi tahu jika penyimpanan gagal.

## Protokol krisis dan keamanan

1. Validasi payload dan hapus kontrol nonteks/tag. Input maksimal 2.000 karakter. Body dibatasi 96 KB termasuk request tanpa `Content-Length`. Hanya role `user` dan `assistant`; klien tidak bisa memasukkan role `system`. Konteks dipangkas menjadi 20 pesan.
2. Detektor backend memeriksa pesan pengguna sebelum provider, klasifikasi, dan balasan. Ia menormalkan kapital, slang, variasi angka, serta frasa yang dipisah. Beberapa negasi dan konteks netral ditangani.
3. Status risiko dikirim sebagai event SSE pertama. Untuk risiko medium/high, **kartu bantuan muncul di atas chat dan jawaban terkurasi dipakai tanpa memanggil provider**. Rate limit tetap mengirim risiko dan bantuan. Detektor di klien menjadi lapisan cadangan saat koneksi ke backend sendiri gagal.
4. Untuk risiko awal none/low, classifier LLM dapat menaikkan risiko ke none/low/medium/high. Ia tidak bisa menurunkan hasil deterministik. Jika classifier gagal pada sinyal low, risiko dinaikkan ke medium. Jika tak ada sinyal deterministik dan classifier gagal, respons normal mencoba berjalan; ini batas pendekatan yang harus dievaluasi sebelum rilis publik.
5. “Aku aman sekarang” / “Aku sudah menghubungi seseorang” melembutkan tampilan dan menambahkan respons pendamping. Kartu tidak disembunyikan dan risiko percakapan tidak dihapus. Risiko dipulihkan dari pesan saat membuka riwayat.
6. System prompt tetap di server, dengan aturan mode, keselamatan, dan larangan mengikuti instruksi pengguna untuk mengubah aturan atau membocorkan prompt. Pesan diperlakukan sebagai data tidak tepercaya. React merender plain text, tanpa HTML/Markdown dari LLM. Tidak ada tools yang bisa dipanggil LLM.
7. Timeout classifier 6 detik, generasi 40 detik, klien 60 detik; pembatalan saat meninggalkan chat. Stream kosong/terputus/error diganti balasan hangat dan tautan Bantuan. Status risiko tetap dipertahankan.
8. Rate limit 20 request valid/menit/IP, hanya counter dan waktu kedaluwarsa dalam memori. Setelan proxy harus sesuai topologi nyata agar header palsu tidak mengganti IP.

Detektor berbasis frasa **bukan penilaian klinis** dan bisa menghasilkan false positive/negative. Prompt injection tidak bisa dijamin hilang hanya dengan prompt. Respons medium/high dibuat deterministik untuk membatasi risiko; keluaran LLM normal tetap memerlukan evaluasi keselamatan Bahasa Indonesia, termasuk percakapan panjang, negasi, ejaan baru, dan jailbreak sebelum rilis luas. Rate limit Worker berlaku per isolate dan Express per proses; untuk skala multiproses/multi-isolate, tambahkan rate limit di edge/proxy tepercaya. Tidak ada isi chat yang perlu disimpan untuk itu.

**Verifikasi sebelum rilis:** semua nomor, ekstensi, situs, biaya, jam, dan jangkauan bantuan di `shared/config.ts`. Kontak berasal dari brief pengguna, belum diverifikasi secara operasional. Tidak ada panggilan uji ke layanan darurat. Klaim gratis mengikuti brief dan ditandai perlu verifikasi. Layanan bisa berubah; aplikasi tidak menjanjikan ketersediaan atau kerahasiaan layanan pihak lain.

## Pemeriksaan

```powershell
npm run lint
npm test
npm run build
npm run verify:client
# Jalankan npm run dev di terminal lain, lalu:
npm run audit:a11y
```

Lighthouse memakai Chrome atau Edge headless yang sudah terpasang. Hasil per halaman disimpan di `reports/accessibility-*.html` dan `.json`; skrip gagal jika ada skor aksesibilitas ≤90. Audit otomatis tidak menggantikan pemeriksaan keyboard/screen reader manusia.

Tes mencakup detektor positif/negatif/slang/kapital, risiko sebelum provider, eskalasi classifier, kegagalan AI dan rate limit, validasi/20 pesan, parser SSE terpotong/UTF-8, penyimpanan privat, pemulihan kartu dari riwayat, dan kartu tetap terlihat ketika fetch gagal. `verify:client` memindai bundle publik untuk prompt/konfigurasi server dan nilai API key yang sedang aktif di environment.

## Asumsi desain

Versi 1 memiliki satu ruang percakapan per browser, tanpa akun, sinkronisasi, database, atau analytics. Default mendengarkan dan default demo dipilih agar pengalaman bisa dicoba tanpa kunci. Kutipan bukan jawaban klinis. Warna krem/sage/terakota, font Lora + Nunito Sans yang dibundel lokal, teks minimal 16px, ilustrasi SVG, mode malam lembut, fokus keyboard, dialog native, dan `prefers-reduced-motion` diterapkan. Struktur dan urutan pekerjaan tersedia di `PLAN.md`.
