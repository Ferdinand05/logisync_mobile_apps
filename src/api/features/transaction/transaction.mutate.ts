import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UseMutationReturnType } from '@tanstack/vue-query';

import type { StockMovementRequest } from './types';

import client from '@/api/client';

function useStockMovement(
  path: '/transactions/in' | '/transactions/out',
): UseMutationReturnType<unknown, Error, StockMovementRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockMovementRequest) => {
      const { data } = await client.post(path, payload);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['locations'] }),
        queryClient.invalidateQueries({ queryKey: ['location-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['item-lookup'] }),
      ]);
    },
  });
}

/** POST /transactions/in */
export function useStockIn(): UseMutationReturnType<unknown, Error, StockMovementRequest, unknown> {
  return useStockMovement('/transactions/in');
}

/** POST /transactions/out */
export function useStockOut(): UseMutationReturnType<unknown, Error, StockMovementRequest, unknown> {
  return useStockMovement('/transactions/out');
}
