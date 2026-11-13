import { useQuery } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';

import type { MeResponse } from './types';

import client from '@/api/client';

/** GET /auth/me - used to refresh the cached profile from the server. */
export function useMe(): UseQueryReturnType<MeResponse['data'], Error> {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await client.get<MeResponse>('/auth/me');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
