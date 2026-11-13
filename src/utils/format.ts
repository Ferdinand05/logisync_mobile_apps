const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Formats ISO timestamps for display, falling back to the raw string. */
export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

/** Turns `in_progress` / `stock_in` into `In Progress` / `Stock In`. */
export function toLabel(value?: string | null): string {
  if (!value) {
    return '-';
  }
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function formatQty(value?: number | null): string {
  if (value === null || value === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(value);
}
