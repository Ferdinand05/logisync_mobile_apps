import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAuth } from '@/composables/useAuth';

const mocks = vi.hoisted(() => ({
  token: null as string | null,
  user: null as unknown,
}));

vi.mock('@/utils/storage', () => ({
  getToken: vi.fn(async () => mocks.token),
  getStoredUser: vi.fn(async () => mocks.user),
  setToken: vi.fn(async (token: string) => {
    mocks.token = token;
  }),
  setStoredUser: vi.fn(async (user: unknown) => {
    mocks.user = user;
  }),
  clearAuth: vi.fn(async () => {
    mocks.token = null;
    mocks.user = null;
  }),
}));

const sampleUser = { id: 1, name: 'Budi Santoso', email: 'budi@logisync.id', role: 'staff' };

describe('useAuth', () => {
  beforeEach(() => {
    mocks.token = null;
    mocks.user = null;
  });

  test('hydrate restores token and user from storage', async () => {
    mocks.token = 'abc123';
    mocks.user = sampleUser;

    const auth = useAuth();
    await auth.hydrate();

    expect(auth.isAuthenticated.value).toBe(true);
    expect(auth.user.value).toEqual(sampleUser);
    expect(auth.hydrated.value).toBe(true);
  });

  test('signIn persists the session and marks the user authenticated', async () => {
    const auth = useAuth();
    await auth.signIn('new-token', sampleUser);

    expect(mocks.token).toBe('new-token');
    expect(mocks.user).toEqual(sampleUser);
    expect(auth.isAuthenticated.value).toBe(true);
  });

  test('signOut clears the session', async () => {
    const auth = useAuth();
    await auth.signIn('new-token', sampleUser);
    await auth.signOut();

    expect(mocks.token).toBeNull();
    expect(mocks.user).toBeNull();
    expect(auth.isAuthenticated.value).toBe(false);
  });
});
