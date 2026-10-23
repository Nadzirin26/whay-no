export const categories = ['Lagi capek', 'Merasa tidak adil', 'Merasa gagal', 'Kesepian', 'Kehilangan', 'Mau menyerah'] as const;
export type Category = typeof categories[number];
const originals: Record<Category, string[]> = {
  'Lagi capek': [
    'Kamu boleh meletakkan sebagian beban hari ini. Tidak semua harus ikut dibawa sampai tidur.',
    'Istirahat tidak perlu menunggu semua urusan selesai. Kamu juga bagian yang perlu dirawat.',
    'Kalau langkahmu kecil hari ini, kita sesuaikan jalannya. Tidak ada perlombaan di sini.',
    'Tubuhmu tidak sedang menghambatmu ketika meminta jeda. Ia sedang berusaha menjagamu.',
    'Ada hari untuk melangkah jauh. Ada hari untuk duduk dan mengumpulkan tenaga. Keduanya punya tempat.',
    'Kamu tidak perlu membuat lelahmu terlihat indah agar layak didengarkan.',
    'Satu urusan yang belum selesai tidak menghapus semua yang sudah kamu jalani hari ini.',
    'Malam ini, bolehkah tuntutan pada dirimu dibuat sedikit lebih ringan?',
    'Yang kamu butuhkan mungkin bukan dorongan lebih keras, melainkan ruang untuk bernapas.',
    'Meski daftar tugasmu panjang, kebutuhanmu untuk beristirahat tetap boleh mendapat giliran.',
  ],
  'Merasa tidak adil': [
    'Kamu boleh kecewa pada keadaan tanpa harus menjadikan dirimu tempat menaruh semua kesalahan.',
    'Ada usaha yang belum bertemu hasil. Itu menyakitkan, dan rasa sakit itu layak mendapat ruang.',
    'Kamu tidak harus menyebut pengalaman berat sebagai pelajaran sebelum kamu siap.',
    'Rasa iri kadang menunjukkan sesuatu yang sudah lama kamu butuhkan. Kita boleh mendengarnya pelan-pelan.',
    'Tidak semua hal berada dalam kendalimu. Kamu tidak perlu memikul tanggung jawab untuk semuanya.',
    'Kamu boleh marah karena jalanmu terasa lebih sulit. Perasaan itu tidak membuatmu menjadi orang buruk.',
    'Pengakuan bahwa ini berat tidak mengurangi keberanianmu untuk menjalani hari berikutnya.',
    'Kita tidak harus membenarkan keadaan untuk mulai merawat dirimu di dalamnya.',
    'Saat hasil terasa timpang, harga dirimu tidak perlu ikut ditimbang di sana.',
    'Kamu masih boleh memilih satu hal kecil untuk dirimu, bahkan ketika pilihan besarnya belum tersedia.',
  ],
  'Merasa gagal': [
    'Satu hasil yang mengecewakan tidak cukup luas untuk menceritakan seluruh dirimu.',
    'Kamu sedang belajar hidup dengan sesuatu yang sulit. Tidak ada kewajiban untuk langsung mahir.',
    'Mengubah arah setelah mencoba bukan berarti perjalananmu sebelumnya sia-sia.',
    'Kamu boleh menyesali keputusan tanpa harus terus menghukum orang yang membuatnya: dirimu yang dulu.',
    'Belum berhasil adalah kabar tentang satu usaha, bukan keputusan akhir tentang nilaimu.',
    'Tidak ada batas usia untuk mencoba dengan cara yang lebih sesuai dengan dirimu sekarang.',
    'Hari ini kamu boleh mengakui kecewa. Menyusun ulang rencana bisa menunggu sampai ada tenaga.',
    'Ada keberanian dalam mengatakan, cara ini belum berhasil dan aku butuh bantuan.',
    'Perjalananmu tidak harus terlihat rapi agar setiap usahanya tetap berarti.',
    'Kamu boleh mulai lagi dari tempatmu sekarang, dengan bekal yang belum sempurna.',
  ],
  'Kesepian': [
    'Rindu untuk didengar bukan permintaan yang berlebihan. Hubungan adalah kebutuhan manusia.',
    'Kalau mengawali percakapan terasa sulit, satu pesan pendek pada orang tepercaya boleh menjadi awal.',
    'Kamu tidak perlu menjadi orang paling ceria agar layak diajak duduk bersama.',
    'Merasa sepi di antara banyak orang tidak membuat perasaanmu kurang nyata.',
    'Ada bagian dari dirimu yang ingin terhubung. Bagian itu layak dirawat, bukan dimarahi.',
    'Kamu boleh menginginkan teman tanpa harus lebih dulu membuktikan bahwa kamu bisa sendirian.',
    'Tidak mendapat balasan hari ini belum menjelaskan seluruh tempatmu dalam hidup orang lain.',
    'Kedekatan boleh tumbuh pelan. Satu percakapan yang jujur dapat menjadi tempat memulai.',
    'Kalau sulit meminta ditemani, kamu boleh memakai kata sederhana: hari ini terasa berat.',
    'Kehadiranmu tidak perlu selalu berguna bagi orang lain agar pantas disambut.',
  ],
  'Kehilangan': [
    'Tidak ada tenggat untuk merindukan sesuatu yang pernah begitu berarti.',
    'Kamu boleh menemukan hari yang ringan tanpa merasa sedang melupakan yang hilang.',
    'Duka bisa datang lagi setelah hari yang tenang. Itu tidak berarti kamu kembali ke awal.',
    'Tidak semua kehilangan punya kata penutup. Kamu boleh merawat dirimu sambil belum memahami semuanya.',
    'Kenangan yang hangat dan rasa sakit boleh duduk berdampingan hari ini.',
    'Kamu tidak harus segera mengisi ruang kosong yang ditinggalkan seseorang.',
    'Kalau ceritanya belum sanggup kamu ucapkan, diam bersama orang tepercaya juga boleh.',
    'Merindukan yang dulu ada tidak mengharuskanmu berhenti menjaga yang masih ada: dirimu.',
    'Kamu boleh mengenang dengan caramu sendiri, tanpa mengikuti ukuran duka siapa pun.',
    'Perubahan ini mungkin terasa asing. Kamu boleh membutuhkan teman untuk menjalaninya.',
  ],
  'Mau menyerah': [
    'Kita tidak perlu memutuskan seluruh masa depan saat hati sedang sangat berat. Mari cari pendamping untuk saat ini.',
    'Kalau harapan terasa jauh, kamu boleh meminjam kehadiran orang lain untuk melewati jam ini.',
    'Meminta seseorang tinggal menemanimu adalah kebutuhan yang layak disampaikan.',
    'Kamu tidak harus menemukan alasan besar hari ini. Mendapat bantuan untuk saat ini sudah cukup penting.',
    'Saat pikiranmu terasa buntu, orang tepercaya boleh ikut membantu melihat pilihan yang belum terlihat.',
    'Yang sedang kamu tanggung pantas mendapat pertolongan nyata, bukan tuntutan untuk lebih kuat.',
    'Kamu boleh berkata aku butuh ditemani, bahkan ketika belum bisa menjelaskan semuanya.',
    'Ada hal yang terlalu berat untuk dipikul sendiri. Membaginya pada orang yang aman boleh menjadi langkah berikutnya.',
    'Kalau hari ini terasa terlalu panjang, kita perkecil waktunya sambil mencari seseorang yang bisa menemanimu.',
    'Kamu tidak perlu menunggu keadaan menjadi lebih buruk untuk menghubungi bantuan.',
  ],
};
export const quotes = categories.flatMap((category, c) => originals[category].map((text, i) => ({ id: `q-${c}-${i}`, category, text })));
export type Quote = typeof quotes[number];
export function randomQuote(exclude?: string): Quote {
  const options = quotes.filter(q => q.id !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}
