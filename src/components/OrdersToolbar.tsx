// OrdersToolbar — tab สถานะ (พร้อมตัวเลข) + ช่องค้นหา + select สถานะ

import { Search } from 'lucide-react';
import type { Dispatch } from 'react';
import type { FiltersAction } from '../state/filters';
import { ORDER_STATUSES } from '../types';
import type { Filters, OrderStatus } from '../types';
import { STATUS_LABEL } from './StatusBadge';


interface Props {
  filters: Filters;
  counts: Record<OrderStatus | 'all', number>;
  dispatch: Dispatch<FiltersAction>;
}

// tab = 'all' + ทุกสถานะ (มาจาก ORDER_STATUSES ไม่พิมพ์ซ้ำ)
const TABS = ['all', ...ORDER_STATUSES] as const;
const tabLabel = (t: (typeof TABS)[number]) => (t === 'all' ? 'All' : STATUS_LABEL(t));

export function OrdersToolbar({ filters, counts, dispatch }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 pt-4">
      {/* แถวบน: ค้นหา + select */}
      <div className="flex items-center gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => dispatch({ type: 'setQuery', q: e.target.value })}
            placeholder="Search order, customer, email…"
            className="h-9 w-full rounded-lg border border-slate-200 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          />
        </label>

        <select
          aria-label="Filter by status"
          value={filters.status}
          // ค่าใน option มาจาก TABS เท่านั้น จึง cast เป็น Filters['status'] ได้ปลอดภัย
          onChange={(e) => dispatch({ type: 'setStatus', status: e.target.value as Filters['status'] })}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          {TABS.map((t) => (
            <option key={t} value={t}>
              Status: {tabLabel(t)}
            </option>
          ))}
        </select>
      </div>

      {/* แถวล่าง: tab สถานะ + ตัวเลข */}
      <div role="tablist" className="-mb-px flex gap-6">
        {TABS.map((t) => {
          const active = filters.tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => dispatch({ type: 'setTab', tab: t })}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
                active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tabLabel(t)}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                {counts[t]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}