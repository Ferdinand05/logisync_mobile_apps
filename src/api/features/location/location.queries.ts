import { useQuery } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';

import type { Location, LocationDetail } from './types';

import client from '@/api/client';
import { unwrapCollection, unwrapItem } from '@/api/normalize';
import type { CollectionPage } from '@/api/normalize';

/** GET /locations */
export function useLocations(): UseQueryReturnType<CollectionPage<Location>, Error> {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await client.get('/locations');
      return unwrapCollection<Location>(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /locations/{id}/items */
export function useLocationDetail(locationId: Ref<number>): UseQueryReturnType<LocationDetail | null, Error> {
  return useQuery({
    queryKey: computed(() => ['location-detail', locationId.value]),
    queryFn: async () => {
      const { data } = await client.get(`/locations/${locationId.value}/items`);
      return unwrapItem<LocationDetail>(data);
    },
    enabled: computed(() => Number.isFinite(locationId.value) && locationId.value > 0),
  });
}
