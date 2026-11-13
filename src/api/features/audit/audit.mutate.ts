import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UseMutationReturnType } from '@tanstack/vue-query';
import type { Ref } from 'vue';

import type { ScanAuditItemRequest } from './types';

import client from '@/api/client';

/** POST /audit-sessions/{id}/scan */
export function useScanAuditItem(
  sessionId: Ref<number>,
): UseMutationReturnType<unknown, Error, ScanAuditItemRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ScanAuditItemRequest) => {
      const { data } = await client.post(`/audit-sessions/${sessionId.value}/scan`, payload);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['audit-items', sessionId.value] }),
        queryClient.invalidateQueries({ queryKey: ['audit-session', sessionId.value] }),
        queryClient.invalidateQueries({ queryKey: ['audit-sessions'] }),
      ]);
    },
  });
}
