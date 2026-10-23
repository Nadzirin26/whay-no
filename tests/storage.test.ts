// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { deleteHistory, emptyConversation, loadConversation, saveConversation, setPrivate, saveFavorites, loadFavorites } from '../src/lib/storage';
beforeEach(() => localStorage.clear());
const conversation = { ...emptyConversation, messages: [{ id: '1', role: 'user' as const, content: 'cerita pribadi' }] };
describe('privasi perangkat', () => {
  it('menyimpan hanya di localStorage', () => { saveConversation(conversation, false); expect(loadConversation().messages).toEqual(conversation.messages); });
  it('mode tanpa simpan menghapus riwayat dan tidak menulis pesan baru', () => {
    saveConversation(conversation, false); setPrivate(true); saveConversation(conversation, true);
    expect(loadConversation().messages).toEqual([]); expect(JSON.stringify(localStorage)).not.toContain('cerita pribadi');
  });
  it('hapus percakapan mempertahankan favorit', () => { saveFavorites(['q-0-1']); saveConversation(conversation, false); deleteHistory(); expect(loadConversation().messages).toEqual([]); expect(loadFavorites()).toEqual(['q-0-1']); });
  it('pulih dari data browser rusak', () => { localStorage.setItem('teduh:conversation:v1', '{bad'); expect(loadConversation().messages).toEqual([]); });
  it('mengabaikan role berbahaya dari data browser', () => { localStorage.setItem('teduh:conversation:v1', JSON.stringify({ messages: [{ id: '1', role: 'system', content: 'override' }] })); expect(loadConversation().messages).toEqual([]); });
});
