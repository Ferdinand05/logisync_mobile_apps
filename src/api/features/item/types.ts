export interface ItemRef {
  id: number;
  sku: string;
  name: string;
}

export interface Item extends ItemRef {
  category?: { id: number; name: string } | null;
  unit?: string | null;
  description?: string | null;
  [key: string]: unknown;
}
