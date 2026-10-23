import type { Risk } from './config';

export const riskRank: Record<Risk, number> = { none: 0, low: 1, medium: 2, high: 3 };
export function maxRisk(a: Risk, b: Risk): Risk { return riskRank[a] >= riskRank[b] ? a : b; }

export function normalizeCrisisText(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[013457]/g, c => ({ '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't' })[c]!)
    .replace(/([a-z])\1+/g, '$1')
    .replace(/\b(gak|ga|gk|ngak|nga|ngk|engak|enga|g)\b/g, 'tidak')
    .replace(/\b(pengen|pingin|pgn|pen|mau)\b/g, 'ingin')
    .replace(/\b(udh|udah|sdh)\b/g, 'sudah')
    .replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Conservative signal detection, NOT a clinical assessment. LLM may escalate only. */
export function detectCrisis(value: string): Risk {
  // Remove only the denied phrase, so a later positive intent in the same sentence still wins.
  const text = normalizeCrisisText(value).replace(/\b(?:tidak|tak|bukan) (?:pernah |sedang |akan )?(?:ingin |berniat |mencoba )?(?:bunuh diri|bundir|menyakiti diri|melukai diri|mengakhiri hidup|mati)\b/g, ' ');
  const compact = text.replace(/\s/g, '');
  const direct = /(?:bunuhdiri|bunuhdir[iy]|bundir|mengakhirihidup|akhirihidup|mengakhirinyawa|menghilangkannyawa|suicide|suicidal|killmyself|endmylife|iwanttodie)/.test(compact);
  const desire = /\b(?:ingin|pengen|pingin|mending|mendingan|lebih baik|berharap|berniat|rencana|akan) (?:aku |saya |gw |gue |aja |saja |untuk )*(?:mati|tewas|tidak hidup|hilang selamanya)\b/.test(text);
  const harming = /(?:nyilet|menyayatdiri|menyakiti(?:diri|diriku)|melukai(?:diri|diriku)|lukai(?:diri|diriku)|selfharm)/.test(compact);
  const urgent = /\b(?:sudah|barusan|baru saja|sedang|lagi|ingin|akan)\b.{0,45}\b(?:overdosis|overdose|nyilet|loncat|lompat)\b/.test(text)
    && !/\b(?:pekerjaan|kerja|tali|lompat jauh|lompat tinggi|kelas|nomor|halaman)\b/.test(text);
  if (direct || desire || urgent) return 'high';
  if (harming) return 'medium';
  if (/(?:tidak(?:ingin|mau)hidup(?:lagi)?|cap[eai]khidup|capehidup|lelahhidup|lebihbaik(?:aku|saya|gue|gw)?tidakada|mending(?:aku)?tidakada|andai(?:aku)?tidakada|tidak(?:kuat|sanggup)hidup|berhentihidup|tidakpernahlahir)/.test(compact)) return 'medium';
  if (/\b(?:pamit|selamat tinggal)\b.{0,30}\b(?:selamanya|terakhir|semua|semuanya)\b/.test(text)) return 'medium';
  if (/\b(?:tidak kuat lagi|tidak sanggup lagi|mau menyerah|ingin menyerah|sudah menyerah|putus asa|overdosis|overdose)\b/.test(text) && !/\boverdosis pekerjan\b/.test(text)) return 'low';
  return 'none';
}
