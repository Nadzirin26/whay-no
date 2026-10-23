import { appConfig } from '../../shared/config';
export async function shareQuote(text: string): Promise<'shared' | 'downloaded'> {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Gambar belum bisa dibuat.');
  ctx.fillStyle = '#FAF6F0'; ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = '#cbd0bd'; ctx.lineWidth = 2; ctx.strokeRect(48, 48, 984, 984);
  ctx.fillStyle = '#53664c'; ctx.font = '28px "Nunito Sans", sans-serif'; ctx.fillText('SEBUAH PENGINGAT KECIL', 100, 150);
  ctx.font = '44px Lora, Georgia, serif'; ctx.fillStyle = '#403c34';
  const lines: string[] = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 860 && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, 100, 330 + i * 68));
  ctx.fillStyle = '#53664c'; ctx.font = '38px Lora, Georgia, serif'; ctx.fillText(appConfig.name.toLowerCase() + '.', 100, 915);
  ctx.font = '24px "Nunito Sans", sans-serif'; ctx.fillText('Ruang untuk merasa.', 100, 960);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Gambar gagal dibuat.')), 'image/png'));
  const file = new File([blob], `${appConfig.name.toLowerCase()}-pengingat.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Pengingat kecil dari ' + appConfig.name }); return 'shared'; }
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
