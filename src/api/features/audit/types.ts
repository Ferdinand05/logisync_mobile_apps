export interface AuditSessionSummary {
  id: number;
  audit_number: string;
  audit_method: string;
  status: string;
  location: {
    id: number | null;
    code: string | null;
    name: string | null;
  } | null;
  category: {
    id: number | null;
    name: string | null;
  } | null;
  created_at: string | null;
  items_total?: string;
  items_scanned?: string;
}

export interface AuditSessionDetail {
  id: number;
  audit_number: string;
  location_id: number | null;
  created_by: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  audit_method: string;
  category_id: number | null;
  item_ids: unknown[] | null;
}

export interface AuditItem {
  id: number;
  item: {
    id: number;
    sku: string;
    name: string;
  };
  location: {
    id: number;
    code: string;
    name: string;
  };
  system_qty: number;
  actual_qty: number | null;
  variance: number | null;
  is_scanned: boolean;
}

export interface ScanAuditItemRequest {
  sku: string;
  location_id: number;
  actual_qty: number;
}
