const KEY = 'miami_whoami';

export function getWhoami(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setWhoami(name: string) {
  try { localStorage.setItem(KEY, name); } catch { /* private mode */ }
}

const ADMIN_KEY = 'miami_admin_key';
export function getAdminKey(): string {
  try { return localStorage.getItem(ADMIN_KEY) || ''; } catch { return ''; }
}
export function setAdminKey(k: string) {
  try { localStorage.setItem(ADMIN_KEY, k); } catch { /* private mode */ }
}
