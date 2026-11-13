import axios from 'axios';

import type { ApiError } from '@/api/features/auth/types';

/**
 * Extracts a human-readable message from Laravel validation/auth errors so views
 * can show something useful without duplicating error parsing.
 */
export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    const firstValidationError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    if (firstValidationError) {
      return firstValidationError;
    }
    if (data?.message) {
      return data.message;
    }
    if (!error.response) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
  }
  return fallback;
}
