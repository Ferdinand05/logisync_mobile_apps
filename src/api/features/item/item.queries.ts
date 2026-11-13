import { useQuery } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';

import type { Item } from './types';

import client from '@/api/client';
import { unwrapItem } from '@/api/normalize';

/**
 * GET /items/lookup?sku=...
 * Used to show the item name under the SKU field before submitting a movement.
 */
export function useItemLookup(sku: Ref<string>): UseQueryReturnType<Item | null, Error> {
  return useQuery({
    queryKey: computed(() => ['item-lookup', sku.value]),
    queryFn: async () => {
      const { data } = await client.get('/items/lookup', { params: { sku: sku.value } });
      return unwrapItem<Item>(data);
    },
    enabled: computed(() => sku.value.trim().length > 0),
    retry: false,
    staleTime: 60 * 1000,
  });
}
