import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

import type { User } from '@/api/features/auth/types';
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from '@/utils/storage';

const token = ref<string | null>(null);
const user = ref<User | null>(null);
const hydrated = ref(false);

async function hydrate(): Promise<void> {
  const [storedToken, storedUser] = await Promise.all([getToken(), getStoredUser<User>()]);
  token.value = storedToken;
  user.value = storedUser;
  hydrated.value = true;
}

async function signIn(nextToken: string, nextUser: User): Promise<void> {
  await Promise.all([setToken(nextToken), setStoredUser(nextUser)]);
  token.value = nextToken;
  user.value = nextUser;
}

async function signOut(): Promise<void> {
  await clearAuth();
  token.value = null;
  user.value = null;
}

export interface AuthStore {
  token: Ref<string | null>;
  user: Ref<User | null>;
  hydrated: Ref<boolean>;
  isAuthenticated: ComputedRef<boolean>;
  hydrate: () => Promise<void>;
  signIn: (nextToken: string, nextUser: User) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthStore {
  const isAuthenticated = computed(() => Boolean(token.value));

  return {
    token,
    user,
    hydrated,
    isAuthenticated,
    hydrate,
    signIn,
    signOut,
  };
}
