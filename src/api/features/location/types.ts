import type { ItemRef } from '@/api/features/item/types';

export interface Location {
  id: number;
  code: string;
  name: string;
}

/**
 * `GET /locations/{id}/items` does not declare an item schema, so stock rows are
 * read defensively: flat fields or a nested `item` object are both supported.
 */
export interface LocationStockEntry {
  id?: number;
  item?: ItemRef | null;
  sku?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  stock?: number;
  [key: string]: unknown;
}

export interface LocationDetail {
  id: number | string;
  code: string;
  name: string;
  items: LocationStockEntry[];
}

export interface StockEntryView {
  key: string;
  sku: string;
  name: string;
  qty: number;
}

/** Normalises an unknown location stock row into something renderable. */
export function toStockEntryView(entry: LocationStockEntry, index: number): StockEntryView {
  const sku = entry.item?.sku ?? entry.sku ?? '-';
  const name = entry.item?.name ?? entry.name ?? 'Tanpa nama';
  const qty = entry.quantity ?? entry.qty ?? entry.stock ?? 0;

  return {
    key: `${entry.item?.id ?? entry.id ?? index}-${sku}`,
    sku,
    name,
    qty: typeof qty === 'number' ? qty : Number(qty) || 0,
  };
}
