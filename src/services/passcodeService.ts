// Service for managing multiple passcodes, roles, and self-verifying Magic Links

export interface PasscodeEntry {
  id: string;
  code: string;
  name: string;
  role: 'admin' | 'full' | 'readonly';
  isMaster?: boolean;
  category: 'owner' | 'family' | 'engineers' | 'contractors' | 'guests';
  createdAt: string;
  expiresAt?: string | null; // ISO string or null for permanent
  isActive: boolean;
  notes?: string;
}

export const MASTER_PASSCODE = 'andreas';

// Built-in preconfigured passcodes available across all devices
export const DEFAULT_PASSCODES: PasscodeEntry[] = [
  {
    id: 'pass-andreas',
    code: 'andreas',
    name: 'Ανδρέας (Master Admin)',
    role: 'admin',
    isMaster: true,
    category: 'owner',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πλήρης πρόσβαση στο σύστημα και στην κονσόλα διαχείρισης κωδικών (/admin).'
  },
  {
    id: 'pass-maria',
    code: 'maria',
    name: 'Μαρία (Οικογένεια)',
    role: 'full',
    isMaster: false,
    category: 'family',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πλήρης πρόσβαση σε όλες τις παροχές, σχέδια και αγορές.'
  },
  {
    id: 'pass-arch',
    code: 'architektonas',
    name: 'Αρχιτέκτονας',
    role: 'full',
    isMaster: false,
    category: 'engineers',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πρόσβαση στις κατόψεις, χωροθέτηση και σημειώσεις παροχών.'
  },
  {
    id: 'pass-mep',
    code: 'meletitis',
    name: 'Μελετητής MEP (Μηχανολόγος / Ηλεκτρολόγος)',
    role: 'full',
    isMaster: false,
    category: 'engineers',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πρόσβαση στις μελέτες MEP, διαγράμματα, φορτία και προσφορές.'
  },
  {
    id: 'pass-electric',
    code: 'ilektrologos',
    name: 'Ηλεκτρολόγος Εγκαταστάτης',
    role: 'full',
    isMaster: false,
    category: 'contractors',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πρόσβαση στη λίστα ηλεκτρολογικών παροχών, ύψη τοίχων και κατόψεις.'
  },
  {
    id: 'pass-plumber',
    code: 'ydravlikos',
    name: 'Υδραυλικός Εγκαταστάτης',
    role: 'full',
    isMaster: false,
    category: 'contractors',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Πρόσβαση σε μηχανολογικές παροχές νερού, αποχετεύσεων και ενδοδαπέδιας.'
  },
  {
    id: 'pass-guest',
    code: 'guest',
    name: 'Επισκέπτης (Μόνο Προβολή)',
    role: 'readonly',
    isMaster: false,
    category: 'guests',
    createdAt: '2026-10-14T00:00:00Z',
    expiresAt: null,
    isActive: true,
    notes: 'Προβολή σχεδίων και παροχών χωρίς δικαίωμα επεξεργασίας.'
  }
];

const STORAGE_KEY = 'house_custom_passcodes_v1';
const SECRET_SALT = 'house-lefk-dev-auth-secret-key-2026';

// Get all passcodes (defaults + custom from localStorage)
export function getAllPasscodes(): PasscodeEntry[] {
  if (typeof window === 'undefined') return DEFAULT_PASSCODES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PASSCODES;
    const customList: PasscodeEntry[] = JSON.parse(raw);

    // Merge: custom passcodes override or append to default ones
    const map = new Map<string, PasscodeEntry>();
    DEFAULT_PASSCODES.forEach(item => map.set(item.code.toLowerCase(), item));
    customList.forEach(item => map.set(item.code.toLowerCase(), item));

    return Array.from(map.values());
  } catch (err) {
    console.error('Failed to load passcodes from localStorage:', err);
    return DEFAULT_PASSCODES;
  }
}

// Sync passcodes to Cloudflare KV Edge API
export async function syncPasscodesToCloudflare(list: PasscodeEntry[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/passcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync passcodes to Cloudflare KV:', err);
    return false;
  }
}

// Fetch latest passcodes from Cloudflare KV Edge API
export async function fetchPasscodesFromCloudflare(): Promise<PasscodeEntry[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/passcodes');
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Update local storage without re-triggering network sync
      const toSave = data.filter(item => !item.isMaster);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch passcodes from Cloudflare KV:', err);
    return null;
  }
}

// Save custom passcodes list
export function saveCustomPasscodes(list: PasscodeEntry[]): void {
  if (typeof window === 'undefined') return;
  // Keep only non-master or customized codes
  const toSave = list.filter(item => !item.isMaster);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

  // Sync to Cloudflare Edge KV in background
  syncPasscodesToCloudflare(list).catch(() => {});
}

// Add a new passcode
export function addPasscode(entry: Omit<PasscodeEntry, 'id' | 'createdAt'>): PasscodeEntry {
  const current = getAllPasscodes();
  const normalizedCode = entry.code.trim().toLowerCase();

  const newEntry: PasscodeEntry = {
    ...entry,
    id: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: normalizedCode,
    createdAt: new Date().toISOString()
  };

  const updated = current.filter(c => c.code.toLowerCase() !== normalizedCode);
  updated.push(newEntry);
  saveCustomPasscodes(updated);
  return newEntry;
}

// Update existing passcode
export function updatePasscode(id: string, updates: Partial<PasscodeEntry>): boolean {
  const current = getAllPasscodes();
  const index = current.findIndex(c => c.id === id);
  if (index === -1) return false;

  current[index] = { ...current[index], ...updates };
  saveCustomPasscodes(current);
  return true;
}

// Delete a passcode
export function deletePasscode(id: string): boolean {
  const current = getAllPasscodes();
  const target = current.find(c => c.id === id);
  if (!target || target.isMaster) return false; // Cannot delete master passcode

  const updated = current.filter(c => c.id !== id);
  saveCustomPasscodes(updated);
  return true;
}

// Toggle passcode active status
export function togglePasscodeActive(id: string): boolean {
  const current = getAllPasscodes();
  const target = current.find(c => c.id === id);
  if (!target || target.isMaster) return false;

  target.isActive = !target.isActive;
  saveCustomPasscodes(current);
  return true;
}

// Validate a plain passcode string against all active passcodes
export function validatePasscode(inputCode: string): PasscodeEntry | null {
  if (!inputCode) return null;
  const clean = inputCode.trim().toLowerCase();
  const all = getAllPasscodes();

  const match = all.find(item => item.code.toLowerCase() === clean);
  if (!match || !match.isActive) return null;

  // Check expiration if set
  if (match.expiresAt) {
    const expDate = new Date(match.expiresAt);
    if (expDate.getTime() < Date.now()) {
      return null; // Expired
    }
  }

  return match;
}

// Build standard Magic Link URL for any passcode
export function buildMagicLink(code: string): string {
  const cleanCode = encodeURIComponent(code.trim().toLowerCase());
  if (typeof window === 'undefined') {
    return `https://house.lefk.dev/?auth=${cleanCode}`;
  }
  const base = `${window.location.origin}${window.location.pathname.replace(/\/admin\/?$/, '/')}`;
  return `${base}?auth=${cleanCode}`;
}

// Simple base64 url-safe encoder/decoder for signed tokens
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}

// Generate self-verifying signed token string (valid on any device)
export async function createSignedToken(payload: {
  code: string;
  name: string;
  role: 'admin' | 'full' | 'readonly';
  exp?: number | null;
}): Promise<string> {
  const body = JSON.stringify({
    c: payload.code.trim().toLowerCase(),
    n: payload.name,
    r: payload.role,
    e: payload.exp || null,
    t: Date.now()
  });

  const bodyB64 = base64UrlEncode(body);

  // Compute HMAC signature using Web Crypto API
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET_SALT);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(bodyB64));
    const sigArray = Array.from(new Uint8Array(signature));
    const sigStr = String.fromCharCode.apply(null, sigArray);
    const sigB64 = base64UrlEncode(sigStr);

    return `${bodyB64}.${sigB64}`;
  } catch (err) {
    console.warn('Crypto subtle unavailable, using fallback signature', err);
    // Simple fallback hash
    let hash = 0;
    for (let i = 0; i < bodyB64.length; i++) {
      hash = ((hash << 5) - hash + bodyB64.charCodeAt(i)) | 0;
    }
    return `${bodyB64}.${base64UrlEncode(hash.toString(16))}`;
  }
}

// Verify self-verifying token on any device
export async function verifySignedToken(token: string): Promise<PasscodeEntry | null> {
  if (!token || !token.includes('.')) return null;

  try {
    const [bodyB64, sigB64] = token.split('.');
    if (!bodyB64 || !sigB64) return null;

    // Verify signature
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET_SALT);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigStr = base64UrlDecode(sigB64);
    const sigBytes = new Uint8Array(sigStr.split('').map(c => c.charCodeAt(0)));
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(bodyB64));

    if (!isValid) return null;

    const bodyStr = base64UrlDecode(bodyB64);
    const data = JSON.parse(bodyStr);

    // Check expiration
    if (data.e && data.e < Date.now()) {
      return null;
    }

    return {
      id: `token-${data.c}`,
      code: data.c,
      name: data.n || data.c,
      role: data.r || 'full',
      category: 'guests',
      isMaster: data.c === MASTER_PASSCODE,
      createdAt: new Date(data.t || Date.now()).toISOString(),
      expiresAt: data.e ? new Date(data.e).toISOString() : null,
      isActive: true,
      notes: 'Σύνδεση μέσω Self-Verifying Magic Link.'
    };
  } catch (err) {
    console.error('Error verifying token:', err);
    return null;
  }
}
