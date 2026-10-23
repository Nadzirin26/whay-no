import { appConfig, type Message, type Mode, type Risk } from '../../shared/config';
import { detectCrisis, maxRisk } from '../../shared/crisis';
const keys = { history: 'teduh:conversation:v1', private: 'teduh:private:v1', favorites: 'teduh:favorites:v1', theme: 'teduh:theme:v1' };
export type Conversation = { messages: Message[]; mode: Mode; risk: Risk; acknowledged: boolean };
export const emptyConversation: Conversation = { messages: [], mode: 'listen', risk: 'none', acknowledged: false };
function read(key: string): unknown { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
function write(key: string, value: unknown): boolean { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function deleteHistory(): boolean { try { localStorage.removeItem(keys.history); return true; } catch { return false; } }
export function isPrivate(): boolean { return read(keys.private) === true; }
export function setPrivate(value: boolean): boolean {
  const ok = write(keys.private, value);
  return value ? deleteHistory() && ok : ok;
}
export function loadConversation(): Conversation {
  if (isPrivate()) { deleteHistory(); return { ...emptyConversation }; }
  const raw = read(keys.history) as Partial<Conversation> | null;
  if (!raw || !Array.isArray(raw.messages)) return { ...emptyConversation };
  const messages = raw.messages.filter((m): m is Message => !!m && typeof m.id === 'string' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 5000).slice(-100);
  const savedRisk = ['none', 'low', 'medium', 'high'].includes(raw.risk || '') ? raw.risk! : 'none';
  const risk = messages.filter(m => m.role === 'user').reduce((r, m) => maxRisk(r, detectCrisis(m.content)), savedRisk);
  return { messages, mode: ['listen', 'advice', 'encourage'].includes(raw.mode || '') ? raw.mode! : 'listen', risk, acknowledged: raw.acknowledged === true };
}
export function saveConversation(value: Conversation, privateMode: boolean): boolean {
  if (privateMode) return deleteHistory();
  // Bounded device history. Only the last 20 messages are ever sent to the API.
  return write(keys.history, { ...value, messages: value.messages.slice(-100).map(m => ({ ...m, content: m.content.slice(0, Math.max(5000, appConfig.maxInput)) })) });
}
export function loadFavorites(): string[] { const value = read(keys.favorites); return Array.isArray(value) ? value.filter(v => typeof v === 'string').slice(0, 60) : []; }
export function saveFavorites(value: string[]): boolean { return write(keys.favorites, value); }
export function loadTheme(): boolean { return read(keys.theme) === 'night'; }
export function saveTheme(night: boolean): boolean { return write(keys.theme, night ? 'night' : 'day'); }
