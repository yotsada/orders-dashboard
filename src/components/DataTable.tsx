// DataTable<T> — ตาราง generic ใช้ได้กับข้อมูลทุกชนิด กำหนดคอลัมน์ด้วย keyof T

import type { ReactNode } from 'react';

// คอลัมน์: key ต้องเป็น field จริงของ T (พิมพ์ผิด → compile fail)
export interface Column<T> {
  key: keyof T & string;
  header: string;
  render?: (row: T) => ReactNode; // ไม่ใส่ = แสดงค่าตรงๆ
  className?: string; // ความกว้าง/จัดชิด เช่น 'w-32 text-right'
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  selectedId?: string | null;
  onRowClick?: (row: T) => void;
  // ใช้แทนเนื้อตารางตอน loading/empty/error (หัวตารางยังอยู่)
  body?: ReactNode;
}

export function DataTable<T>({ columns, rows, getRowId, selectedId, onRowClick, body }: DataTableProps<T>) {
  return (
    <table className="w-full table-fixed text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col" className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      {body ?? (
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const id = getRowId(row);
            return (
              <tr
                key={id}
                // data-state ใช้คู่กับ class data-[state=selected]:... ตามโจทย์
                data-state={id === selectedId ? 'selected' : undefined}
                onClick={() => onRowClick?.(row)}
                // เข้าถึงด้วยคีย์บอร์ด: Tab มาที่แถว แล้วกด Enter
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
                className="cursor-pointer text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 data-[state=selected]:bg-indigo-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`truncate px-4 py-3 ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      )}
    </table>
  );
}