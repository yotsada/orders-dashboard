// OrdersToolbar — tab สถานะ (พร้อมตัวเลข) + ช่องค้นหา + select สถานะ + ปุ่ม Filters

import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  // รายการ filter ที่ใช้อยู่ (แสดงใน dropdown ของปุ่ม Filters พร้อมปุ่มลบทีละตัว)
  const active = [
    filters.q.trim() && { label: `Search: "${filters.q.trim()}"`, clear: () => dispatch({ type: 'setQuery', q: '' }) },
    filters.tab !== 'all' && { label: `Tab: ${tabLabel(filters.tab)}`, clear: () => dispatch({ type: 'setTab', tab: 'all' }) },
    filters.status !== 'all' && { label: `Status: ${tabLabel(filters.status)}`, clear: () => dispatch({ type: 'setStatus', status: 'all' }) },
  ].filter((x) => !!x);

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 pt-4">
      {/* แถวบน: ค้นหา + select + ปุ่ม Filters */}
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

        {/* ปุ่ม Filters: badge = จำนวน filter ที่ใช้อยู่ · กดเปิดรายการไว้ลบทีละตัว */}
        <div className="relative" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Filter className="size-4" />
            Filters
            {active.length > 0 && (
              <span className="rounded-full bg-indigo-600 px-1.5 text-xs text-white">{active.length}</span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              {active.length === 0 ? (
                <p className="text-sm text-slate-500">No active filters</p>
              ) : (
                <>
                  <ul className="space-y-2">
                    {active.map((f) => (
                      <li key={f.label} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                        <span className="truncate">{f.label}</span>
                        <button onClick={f.clear} aria-label={`Remove ${f.label}`} className="text-slate-400 hover:text-slate-700">
                          <X className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { dispatch({ type: 'reset' }); setOpen(false); }}
                    className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* แถวล่าง: tab สถานะ + ตัวเลข */}
      <div role="tablist" className="-mb-px flex gap-6">
        {TABS.map((t) => {
          const isActive = filters.tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={isActive}
              onClick={() => dispatch({ type: 'setTab', tab: t })}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
                isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tabLabel(t)}
              <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                {counts[t]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}