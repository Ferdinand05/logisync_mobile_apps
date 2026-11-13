import type { ItemRef } from '@/api/features/item/types';

export type TransactionType = 'in' | 'out' | 'adjustment';

export interface Transaction {
  id: number;
  type: TransactionType;
  quantity: number;
  reference_no: string | null;
  notes: string | null;
  item?: ItemRef | null;
  location?: { id: number; name: string } | null;
  user?: { id: number; name: string } | null;
  created_at: string | null;
}

export interface StockMovementRequest {
  sku: string;
  location_id: number;
  qty: number;
  reference_no: string;
  notes?: string | null;
}
