/** Payload for POST /auth/login */
export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** Response body of POST /auth/login */
export interface LoginResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/** Response body of GET /auth/me */
export interface MeResponse {
  data: User;
}

/** Laravel-style error body (401/403/404/422) */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/** Shape returned by transaction endpoints */
export interface Transaction {
  id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_no: string | null;
  notes: string | null;
  item?: { id: number; sku: string; name: string };
  location?: { id: number; name: string };
  user?: { id: number; name: string };
  created_at: string | null;
}
