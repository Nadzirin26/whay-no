// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Chat } from '../src/pages/Chat';
import { fallbackMessage } from '../shared/config';

beforeEach(() => {
  localStorage.clear();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function offlineProvider() {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url === '/api/health') return Response.json({ ok: true, demo: false });
    throw new Error('network offline');
  }));
}
describe('kartu krisis dan privasi di antarmuka', () => {
  it('kartu bantuan muncul dan tetap ada walau fetch gagal dan pengguna menyatakan aman', async () => {
    offlineProvider(); render(<Chat mood=""/>);
    fireEvent.change(screen.getByLabelText('Ceritamu'), { target: { value: 'aku pengen mati' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim cerita' }));
    expect(screen.getByRole('region', { name: 'Cari seseorang untuk menemanimu sekarang.' })).toBeTruthy();
    await waitFor(() => expect(screen.getAllByText(fallbackMessage)[0]).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Aku aman sekarang' }));
    expect(screen.getByRole('region', { name: 'Bantuan tetap dekat, kapan kamu perlu.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Darurat medis · 119' })).toBeTruthy();
  });
  it('mode tanpa simpan tidak menulis pesan, termasuk ketika request gagal', async () => {
    offlineProvider(); render(<Chat mood=""/>);
    fireEvent.click(screen.getByRole('switch', { name: 'Mode tanpa simpan' }));
    fireEvent.change(screen.getByLabelText('Ceritamu'), { target: { value: 'cerita sintetis privat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim cerita' }));
    await waitFor(() => expect(screen.getAllByText(fallbackMessage)[0]).toBeTruthy());
    expect(JSON.stringify(localStorage)).not.toContain('cerita sintetis privat');
    expect(localStorage.getItem('teduh:conversation:v1')).toBeNull();
  });
  it('memulihkan kartu bantuan dari riwayat meski metadata risiko kosong', () => {
    offlineProvider();
    localStorage.setItem('teduh:conversation:v1', JSON.stringify({ mode: 'listen', messages: [{ id: 'a', role: 'user', content: 'capek hidup' }], risk: 'none' }));
    render(<Chat mood=""/>);
    expect(screen.getByRole('region', { name: 'Cari seseorang untuk menemanimu sekarang.' })).toBeTruthy();
  });
});
