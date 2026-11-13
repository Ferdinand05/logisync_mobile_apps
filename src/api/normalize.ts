export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface CollectionPage<T> {
  items: T[];
  meta: PaginationMeta | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Single-resource endpoints are documented as `{ data: X }`, but some return the
 * resource directly. Handles both shapes.
 */
export function unwrapItem<T>(payload: unknown): T | null {
  if (!isRecord(payload)) {
    return null;
  }
  if (isRecord(payload.data)) {
    return payload.data as T;
  }
  return payload as T;
}

/**
 * Collection endpoints vary: bare arrays, `{ data: [...] }`, or the Laravel
 * paginator shape `{ data: { data: [...], meta: {...} } }`. Normalises all three.
 */
export function unwrapCollection<T>(payload: unknown): CollectionPage<T> {
  const source = isRecord(payload) && isRecord(payload.data) && !Array.isArray(payload.data) ? payload.data : payload;

  if (Array.isArray(source)) {
    return { items: source as T[], meta: null };
  }

  if (isRecord(source) && Array.isArray(source.data)) {
    return {
      items: source.data as T[],
      meta: isRecord(source.meta) ? (source.meta as unknown as PaginationMeta) : null,
    };
  }

  return { items: [], meta: null };
}

/** Returns the next page number, or undefined when the last page is reached. */
export function nextPageParam(meta: PaginationMeta | null): number | undefined {
  if (!meta || typeof meta.current_page !== 'number' || typeof meta.last_page !== 'number') {
    return undefined;
  }
  return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
}
