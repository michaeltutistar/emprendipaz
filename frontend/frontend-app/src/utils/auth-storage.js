import { isInstalledPwa } from './pwa';

const AUTH_TOKEN_KEY = 'authToken';
const PWA_USER_KEY = 'pwa_user_profile_v1';
const FORCE_LOGOUT_KEY = 'pwa_force_logged_out_v1';

export function getAuthToken() {
  try {
    // Mantener compatibilidad con el código existente (muchas pantallas leen localStorage directamente).
    // La persistencia "offline" se controla por lógica (PWA instalada) en lugar de por el storage.
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  if (!token) return;
  try {
    // Guardar en ambos para maximizar compatibilidad (PWA y web)
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    // Si el usuario inició sesión explícitamente, permitir refresh de nuevo
    localStorage.removeItem(FORCE_LOGOUT_KEY);
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getPwaCachedUser() {
  try {
    const raw = localStorage.getItem(PWA_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ?? null;
  } catch {
    return null;
  }
}

export function setPwaCachedUser(user) {
  try {
    if (!isInstalledPwa()) return;
    if (!user || typeof user !== 'object') return;
    localStorage.setItem(PWA_USER_KEY, JSON.stringify({ user, savedAt: Date.now() }));
    localStorage.removeItem(FORCE_LOGOUT_KEY);
  } catch {
    // ignore
  }
}

export function clearPwaCachedUser() {
  try {
    localStorage.removeItem(PWA_USER_KEY);
  } catch {
    // ignore
  }
}

export function isForceLoggedOut() {
  try {
    return localStorage.getItem(FORCE_LOGOUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function canRestorePwaSession() {
  try {
    return isInstalledPwa() && !isForceLoggedOut() && !!getPwaCachedUser();
  } catch {
    return false;
  }
}

export function setForceLoggedOut() {
  try {
    localStorage.setItem(FORCE_LOGOUT_KEY, '1');
  } catch {
    // ignore
  }
}

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '==='.slice((b64.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token, skewSeconds = 60) {
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload?.exp;
    if (!exp) return false; // tokens viejos sin exp parseable: no bloquear
    const now = Math.floor(Date.now() / 1000);
    return exp <= (now + Number(skewSeconds || 0));
  } catch {
    return false;
  }
}

export function clearLocalSession() {
  // Marcar logout local para evitar auto-refresh (si el refresh cookie sigue vivo)
  setForceLoggedOut();
  clearAuthToken();
  clearPwaCachedUser();
}

