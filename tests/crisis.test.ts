import { describe, expect, it } from 'vitest';
import { detectCrisis, maxRisk } from '../shared/crisis';
describe('detektor krisis Indonesia', () => {
  it.each([
    ['aku ingin mati', 'high'], ['AKU PENGEN MATI AJA', 'high'], ['gw pgn mati', 'high'],
    ['aku mau bunuh diri', 'high'], ['ingin mengakhiri hidup', 'high'], ['bUnUh DiRi', 'high'],
    ['b u n u h d i r i', 'high'], ['aku ingin bunuh-diri', 'high'], ['4ku pengen m4t1', 'high'],
    ['aku udah overdosis', 'high'], ['aku mau loncat', 'high'], ['aku sedang nyilet', 'high'],
    ['aku menyakiti diri', 'medium'], ['melukai diriku', 'medium'], ['nyilet', 'medium'],
    ['aku nggak mau hidup lagi', 'medium'], ['aku gak mau hidup lagi', 'medium'], ['gk mau hidup lagi', 'medium'],
    ['capek hidup', 'medium'], ['cape hidup', 'medium'], ['lebih baik aku nggak ada', 'medium'],
    ['aku pamit selamanya', 'medium'], ['aku udah nggak kuat lagi', 'low'], ['aku putus asa', 'low'],
    ['aku tidak ingin bunuh diri tapi sekarang mau mati', 'high'],
    ['aku tidak ingin bunuh diri dan aku mau mati', 'high'],
    ['gw pengen matiiiii', 'high'], ['aku mau bundir', 'high'],
    ['aku nggakkk mau hidup lagi', 'medium'], ['capee hiduppp', 'medium'],
    ['aku pamit ya semuanya', 'medium'], ['andai aku tidak pernah lahir', 'medium'],
  ])('mendeteksi %s sebagai %s', (text, expected) => expect(detectCrisis(text)).toBe(expected));
  it.each([
    'Aku capek kerja hari ini', 'Aku sedih dan pengin cerita', 'hidupku rasanya tidak adil',
    'mati lampu di rumah', 'baterai HP mati', 'bunuh proses di komputer', 'mau loncat kelas',
    'ayo lompat tali', 'pamit tidur dulu', 'Aku tidak ingin bunuh diri', 'aku tidak menyakiti diri',
    'Aku cemas menunggu hasil ujian', 'aku overdosis pekerjaan',
    'aku gak mau mati', 'aku tidak mau bundir',
  ])('tidak menganggap konteks netral sebagai krisis: %s', text => expect(detectCrisis(text)).toBe('none'));
  it('tidak menurunkan risiko deterministik', () => { expect(maxRisk('high', 'none')).toBe('high'); expect(maxRisk('low', 'medium')).toBe('medium'); });
});
