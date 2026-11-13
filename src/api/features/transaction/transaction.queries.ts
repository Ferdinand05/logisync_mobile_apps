import { useInfiniteQuery } from '@tanstack/vue-query';
import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';

import type { Transaction, TransactionType } from './types';

import client from '@/api/client';
import { nextPageParam, unwrapCollection } from '@/api/normalize';
import type { CollectionPage } from '@/api/normalize';

export type TransactionFilter = TransactionType | 'all';

/** GET /transactions?type=&page= */
export function useTransactions(
  filter: Ref<TransactionFilter>,
): UseInfiniteQueryReturnType<InfiniteData<CollectionPage<Transaction>>, Error> {
  return useInfiniteQuery({
    queryKey: computed(() => ['transactions', filter.value]),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await client.get('/transactions', {
        params: {
          type: filter.value === 'all' ? undefined : filter.value,
          page: pageParam,
        },
      });
      return unwrapCollection<Transaction>(data);
    },
    getNextPageParam: (lastPage) => nextPageParam(lastPage.meta),
  });
}
