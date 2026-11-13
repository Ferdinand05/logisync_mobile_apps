import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import type { InfiniteData, UseInfiniteQueryReturnType, UseQueryReturnType } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';

import type { AuditItem, AuditSessionDetail, AuditSessionSummary } from './types';

import client from '@/api/client';
import { nextPageParam, unwrapCollection, unwrapItem } from '@/api/normalize';
import type { CollectionPage } from '@/api/normalize';

/** GET /audit-sessions */
export function useAuditSessions(): UseInfiniteQueryReturnType<
  InfiniteData<CollectionPage<AuditSessionSummary>>,
  Error
> {
  return useInfiniteQuery({
    queryKey: ['audit-sessions'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await client.get('/audit-sessions', { params: { page: pageParam } });
      return unwrapCollection<AuditSessionSummary>(data);
    },
    getNextPageParam: (lastPage) => nextPageParam(lastPage.meta),
  });
}

/** GET /audit-sessions/{id} */
export function useAuditSession(sessionId: Ref<number>): UseQueryReturnType<AuditSessionDetail | null, Error> {
  return useQuery({
    queryKey: computed(() => ['audit-session', sessionId.value]),
    queryFn: async () => {
      const { data } = await client.get(`/audit-sessions/${sessionId.value}`);
      return unwrapItem<AuditSessionDetail>(data);
    },
    enabled: computed(() => Number.isFinite(sessionId.value) && sessionId.value > 0),
  });
}

/** GET /audit-sessions/{id}/items */
export function useAuditItems(
  sessionId: Ref<number>,
): UseInfiniteQueryReturnType<InfiniteData<CollectionPage<AuditItem>>, Error> {
  return useInfiniteQuery({
    queryKey: computed(() => ['audit-items', sessionId.value]),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await client.get(`/audit-sessions/${sessionId.value}/items`, {
        params: { page: pageParam },
      });
      return unwrapCollection<AuditItem>(data);
    },
    getNextPageParam: (lastPage) => nextPageParam(lastPage.meta),
    enabled: computed(() => Number.isFinite(sessionId.value) && sessionId.value > 0),
  });
}
