// kpi.test — ตัวเลข KPI ตรงกับการนับเองจากข้อมูล

import { describe, expect, it } from 'vitest';
import { MOCK_ORDERS } from '../mock/orders';
import { computeKpis } from './kpi';

describe('computeKpis', () => {
  it('counts orders in the last 30 days and compares with the 30 days before', () => {
    const end = Math.max(...MOCK_ORDERS.map((o) => Date.parse(o.createdAt)));
    const DAY = 86_400_000;
    const inLast30 = MOCK_ORDERS.filter((o) => Date.parse(o.createdAt) > end - 30 * DAY).length;
    const inPrev30 = MOCK_ORDERS.filter((o) => {
      const t = Date.parse(o.createdAt);
      return t > end - 60 * DAY && t <= end - 30 * DAY;
    }).length;

    const orders = computeKpis(MOCK_ORDERS).find((k) => k.label === 'Orders')!;
    expect(orders.value).toBe(inLast30);
    expect(orders.change).toBeCloseTo(((inLast30 - inPrev30) / inPrev30) * 100, 1);
  });

  it('returns no cards for empty data', () => {
    expect(computeKpis([])).toEqual([]);
  });
});