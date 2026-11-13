import { describe, expect, test } from 'vitest';

import { nextPageParam, unwrapCollection, unwrapItem } from '@/api/normalize';

describe('unwrapCollection', () => {
  test('accepts a bare array', () => {
    expect(unwrapCollection<number>([1, 2]).items).toEqual([1, 2]);
    expect(unwrapCollection<number>([1, 2]).meta).toBeNull();
  });

  test('accepts { data: [...] }', () => {
    expect(unwrapCollection<number>({ data: [1, 2] }).items).toEqual([1, 2]);
  });

  test('accepts a Laravel paginator payload', () => {
    const page = unwrapCollection<number>({
      data: {
        data: [1, 2],
        meta: { current_page: 2, last_page: 4, per_page: 2, total: 8, from: 3, to: 4 },
      },
    });

    expect(page.items).toEqual([1, 2]);
    expect(page.meta?.current_page).toBe(2);
  });

  test('returns an empty page for unexpected payloads', () => {
    expect(unwrapCollection<number>(null).items).toEqual([]);
    expect(unwrapCollection<number>({ message: 'nope' }).items).toEqual([]);
  });
});

describe('unwrapItem', () => {
  test('unwraps { data: X }', () => {
    expect(unwrapItem<{ id: number }>({ data: { id: 7 } })).toEqual({ id: 7 });
  });

  test('accepts a bare resource', () => {
    expect(unwrapItem<{ id: number }>({ id: 7 })).toEqual({ id: 7 });
  });

  test('returns null for primitives', () => {
    expect(unwrapItem(null)).toBeNull();
    expect(unwrapItem('text')).toBeNull();
  });
});

describe('nextPageParam', () => {
  test('returns the next page while more remain', () => {
    expect(nextPageParam({ current_page: 1, last_page: 3, per_page: 10, total: 25, from: 1, to: 10 })).toBe(2);
  });

  test('returns undefined on the last page', () => {
    expect(nextPageParam({ current_page: 3, last_page: 3, per_page: 10, total: 25, from: 21, to: 25 })).toBeUndefined();
  });

  test('returns undefined without meta (unpaginated responses)', () => {
    expect(nextPageParam(null)).toBeUndefined();
  });
});
