// Pagination — footer ตาราง: rows-per-page + "1–8 of 40" + ปุ่มเปลี่ยนหน้า

import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [8, 16, 24] as const;

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }: Props) {
  // ช่วงแถวที่กำลังแสดง เช่น 9–16
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btn = 'grid size-8 place-items-center rounded-lg text-sm disabled:opacity-40';

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
      <label className="flex items-center gap-2">
        Rows per page
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-slate-700"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-4">
        <span>
          {from}–{to} of {total}
        </span>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button className={`${btn} hover:bg-slate-100`} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${btn} ${p === page ? 'bg-indigo-600 font-medium text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          ))}
          <button className={`${btn} hover:bg-slate-100`} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
            <ChevronRight className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}