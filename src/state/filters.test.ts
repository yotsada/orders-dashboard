// filters.test — การเรียงคอลัมน์ (ค่าเริ่มต้น Date ใหม่→เก่า + กดสลับทิศ)

import { describe, expect, it } from 'vitest';
import { MOCK_ORDERS } from '../mock/orders';
import { DEFAULT_FILTERS } from '../types';
import { filterOrders, filtersReducer } from './filters';

describe('sort', () => {
  it('defaults to Date newest first', () => {
    const result = filterOrders(MOCK_ORDERS, DEFAULT_FILTERS);
    expect(result[0].createdAt >= result[1].createdAt).toBe(true);
  });

  it('clicking the same column toggles direction and goes back to page 1', () => {
    let f = filtersReducer({ ...DEFAULT_FILTERS, page: 3 }, { type: 'setSort', key: 'totalSatang' });
    expect(f.sort).toEqual({ key: 'totalSatang', dir: 'desc' });
    expect(f.page).toBe(1);

    f = filtersReducer(f, { type: 'setSort', key: 'totalSatang' });
    expect(f.sort.dir).toBe('asc');

    const totals = filterOrders(MOCK_ORDERS, f).map((o) => o.totalSatang);
    expect(totals).toEqual([...totals].sort((a, b) => a - b)); // น้อย → มาก
  });
});