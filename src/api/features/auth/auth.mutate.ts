import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UseMutationReturnType } from '@tanstack/vue-query';

import type { LoginRequest, LoginResponse } from './types';

import client from '@/api/client';
import { useAuth } from '@/composables/useAuth';

/** POST /auth/login - persists token + user on success. */
export function useLogin(): UseMutationReturnType<LoginResponse, Error, LoginRequest, unknown> {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await client.post<LoginResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: async (response) => {
      await signIn(response.data.token, response.data.user);
    },
  });
}

/** POST /auth/logout - clears the local session even if the request fails. */
export function useLogout(): UseMutationReturnType<void, Error, void, unknown> {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await client.post('/auth/logout');
    },
    onSettled: async () => {
      await signOut();
      queryClient.clear();
    },
  });
}
