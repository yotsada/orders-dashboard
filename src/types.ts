export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded';

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled', 'refunded'] as const satisfies readonly OrderStatus[];

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface LineItem {
  productName: string;
  quantity: number;
  unitPriceSatang: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customer: Customer;
  items: LineItem[];
  totalSatang: number;
  createdAt: string;
}

export type TimelineStep =
  | { state: 'done'; label: string; at: string }
  | { state: 'todo'; label: string };

export type Query =
  | { status: 'loading' }
  | { status: 'success'; data: Order[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export interface Filters {
  q: string;
  tab: OrderStatus | 'all';
  status: OrderStatus | 'all';
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTERS = {
  q: '',
  tab: 'all',
  status: 'all',
  page: 1,
  pageSize: 8,
} as const satisfies Filters;