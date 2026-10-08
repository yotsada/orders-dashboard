// StatusBadge — ป้ายสถานะ รับเฉพาะ OrderStatus (ไม่รับ string ทั่วไป)

import type { OrderStatus } from '../types';

// Record<OrderStatus, ...> = ต้องมีครบทุกสถานะ เพิ่มสถานะใหม่แล้วลืมใส่ → compile fail
const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  shipped: { label: 'Shipped', className: 'bg-indigo-50 text-indigo-700' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600' },
  refunded: { label: 'Refunded', className: 'bg-rose-50 text-rose-700' },
};

export const STATUS_LABEL = (s: OrderStatus) => STYLES[s].label;

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {/* จุดสีหน้าข้อความ ใช้ bg-current = สีเดียวกับตัวอักษร */}
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}