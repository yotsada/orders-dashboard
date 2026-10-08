import type { LineItem, Order, OrderStatus } from '../types';

export class MockApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
  }
}

const NAMES = [
  'Aom Chaiyaporn', 'Beam Srisuk', 'Chompoo Wongsa', 'Dao Rattana', 'Earth Kittisak',
  'Fah Siriwan', 'Golf Thanakorn', 'Ice Pimchanok', 'Jane Suda', 'Kan Phuwadol',
];

const PRODUCTS: Omit<LineItem, 'quantity'>[] = [
  { productName: 'Wireless Mouse', unitPriceSatang: 59000 },
  { productName: 'Mechanical Keyboard', unitPriceSatang: 349000 },
  { productName: 'USB-C Hub', unitPriceSatang: 129000 },
  { productName: '27" Monitor', unitPriceSatang: 890000 },
  { productName: 'Laptop Stand', unitPriceSatang: 79000 },
];

const STATUSES: OrderStatus[] = ['paid', 'pending', 'shipped', 'paid', 'cancelled', 'shipped', 'refunded', 'paid'];

export function calcTotalSatang(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceSatang, 0);
}

function makeOrder(i: number): Order {
  const name = NAMES[i % NAMES.length];
  const items: LineItem[] = Array.from({ length: (i % 3) + 1 }, (_, k) => ({
    ...PRODUCTS[(i + k) % PRODUCTS.length],
    quantity: ((i + k) % 3) + 1,
  }));
  const base = Date.UTC(2026, 8, 30, 10, 0);
  const createdAt = new Date(base - i * 17 * 60 * 60 * 1000).toISOString();

  return {
    id: `ORD-${10500 - i}`,
    status: STATUSES[i % STATUSES.length],
    customer: {
      name,
      email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1][0].toLowerCase()}@example.com`,
      phone: `08${String(10000000 + i * 1234567).slice(0, 8)}`,
    },
    items,
    totalSatang: calcTotalSatang(items),
    createdAt,
  };
}

export const MOCK_ORDERS: Order[] = Array.from({ length: 40 }, (_, i) => makeOrder(i));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchOrders(): Promise<Order[]> {
  await delay(500 + Math.random() * 500);

  const mode = new URLSearchParams(window.location.search).get('mock');
  if (mode === 'error') {
    throw new MockApiError(500, 'GET /api/orders → 500');
  }
  if (mode === 'empty') {
    return [];
  }
  return MOCK_ORDERS;
}