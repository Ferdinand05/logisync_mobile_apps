import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'logisync.token';
const USER_KEY = 'logisync.user';

/**
 * Auth data is kept in Capacitor Preferences on native builds (persists across
 * app restarts) and in localStorage when running in the browser.
 */
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getItem(key: string): Promise<string | null> {
  if (isNative()) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isNative()) {
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (isNative()) {
    await Preferences.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await removeItem(TOKEN_KEY);
}

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: unknown): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function removeStoredUser(): Promise<void> {
  await removeItem(USER_KEY);
}

export async function clearAuth(): Promise<void> {
  await Promise.all([removeToken(), removeStoredUser()]);
}
