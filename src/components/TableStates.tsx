// TableStates — เนื้อตารางตอน Loading / Empty / Error (คืน <tbody> แทนแถวข้อมูล)

import { Inbox, Plus, RotateCw, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

// แถวเดียวเต็มความกว้างตาราง ใช้ร่วมกันของ Empty/Error
function FullRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan}>
          <div className="flex flex-col items-center py-16 text-center">{children}</div>
        </td>
      </tr>
    </tbody>
  );
}

// ---------- Loading ----------
// จำนวนแถว = pageSize ปัจจุบัน · animate-pulse ที่ container เดียว
// แท่งเทาวางตรงตำแหน่งข้อมูลจริง → ข้อมูลมาแล้ว layout ไม่กระโดด
export function LoadingRows({ rows }: { rows: number }) {
  const bar = 'h-3 rounded bg-slate-100';
  return (
    <tbody className="animate-pulse divide-y divide-slate-100" aria-busy="true" aria-label="Loading orders">
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i}>
          <td className="px-4 py-3"><div className={`${bar} w-20`} /></td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="size-8 shrink-0 rounded-full bg-slate-100" />
              <div className="flex flex-col gap-2">
                <div className={`${bar} w-32`} />
                <div className={`${bar} w-40`} />
              </div>
            </div>
          </td>
          <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-slate-100" /></td>
          <td className="px-4 py-3"><div className={`${bar} ml-auto w-20`} /></td>
          <td className="px-4 py-3"><div className={`${bar} w-28`} /></td>
          <td className="px-4 py-3"><div className="size-4 rounded bg-slate-100" /></td>
        </tr>
      ))}
    </tbody>
  );
}

// ---------- Empty ----------
// 2 กรณี: 'filtered' = กรองแล้วไม่เจอ (มีปุ่ม Clear) · 'no-data' = ไม่มีข้อมูลเลย
interface EmptyProps {
  colSpan: number;
  variant: 'filtered' | 'no-data';
  onClear: () => void;
}

export function EmptyState({ colSpan, variant, onClear }: EmptyProps) {
  const filtered = variant === 'filtered';
  return (
    <FullRow colSpan={colSpan}>
      <div className="grid size-16 place-items-center rounded-full bg-slate-100">
        <Inbox className="size-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {filtered ? 'No orders match your filters' : 'No orders yet'}
      </h3>
      <p className="mt-1 max-w-[380px] text-sm text-slate-500">
        {filtered
          ? 'Try a different search term or status, or clear all filters to see every order.'
          : 'When customers place orders, they will show up here.'}
      </p>
      <div className="mt-6 flex gap-3">
        {filtered && (
          <button
            onClick={onClear}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        )}
        <button className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="size-4" />
          New order
        </button>
      </div>
    </FullRow>
  );
}

// ---------- Error ----------
// แสดงข้อความสั้นจาก error (ไม่มี stack trace) + ปุ่ม Retry ปุ่มเดียว
interface ErrorProps {
  colSpan: number;
  message: string;
  onRetry: () => void;
}

export function ErrorState({ colSpan, message, onRetry }: ErrorProps) {
  return (
    <FullRow colSpan={colSpan}>
      <div role="alert" className="flex flex-col items-center">
        <div className="grid size-16 place-items-center rounded-full bg-rose-50">
          <TriangleAlert className="size-7 text-rose-600" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Couldn't load orders</h3>
        <p className="mt-1 max-w-[380px] text-sm text-slate-500">
          Something went wrong while fetching orders. Your filters are kept — try again.
        </p>
        <code className="mt-3 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{message}</code>
        <button
          onClick={onRetry}
          className="mt-6 flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <RotateCw className="size-4" />
          Retry
        </button>
      </div>
    </FullRow>
  );
}