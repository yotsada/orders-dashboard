// OrdersTable — ประกอบทุกอย่าง: filter state + โหลดข้อมูล + ตาราง + pagination

import { Eye } from 'lucide-react';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { formatBaht, formatDate, initials } from '../lib/format';
import { countByStatus, filterOrders, filtersReducer, paginate ,isFiltered} from '../state/filters';
import { DEFAULT_FILTERS } from '../types';
import type { Order } from '../types';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';
import { OrderDrawer } from './OrderDrawer';
import { OrdersToolbar } from './OrdersToolbar';
import { Pagination } from './Pagination';
import { StatusBadge } from './StatusBadge';
import { EmptyState, ErrorState, LoadingRows } from './TableStates';


// นิยามคอลัมน์ (อยู่นอก component = ไม่สร้างใหม่ทุก render)
const COLUMNS: Column<Order>[] = [
  { key: 'id', header: 'Order', className: 'w-32 font-medium text-slate-900' },
  {
    key: 'customer',
    header: 'Customer',
    render: (o) => (
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-medium text-indigo-600">
          {initials(o.customer.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{o.customer.name}</p>
          <p className="truncate text-xs text-slate-500">{o.customer.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'status', header: 'Status', className: 'w-32', render: (o) => <StatusBadge status={o.status} /> },
  { key: 'totalSatang', header: 'Total', className: 'w-32 text-right tabular-nums', render: (o) => formatBaht(o.totalSatang) },
  { key: 'createdAt', header: 'Date', className: 'w-44', render: (o) => formatDate(o.createdAt) },
  {
    key: 'items',
    header: '',
    className: 'w-12',
    render: () => <Eye className="size-4 text-slate-400" aria-hidden />,
  },
];

export function OrdersTable() {
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS);
  const { query ,retry } = useOrders();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ข้อมูลทั้งชุด (มีเฉพาะตอน success)
  const all = useMemo(() => (query.status === 'success' ? query.data : []), [query]);

  // derived data — คำนวณใหม่เฉพาะเมื่อ input เปลี่ยน
  const counts = useMemo(() => countByStatus(all, filters.q), [all, filters.q]);
  const filtered = useMemo(() => filterOrders(all, filters), [all, filters]);
  const page = useMemo(() => paginate(filtered, filters.page, filters.pageSize), [filtered, filters.page, filters.pageSize]);


// drawer: เก็บแค่ id แล้วหา order จากข้อมูลชุดหลัก (ไม่ copy object)
  const selectedOrder = useMemo(() => all.find((o) => o.id === selectedId) ?? null, [all, selectedId]);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  // เลือกเนื้อตารางตามสถานะ (ขั้นที่ 7 จะแทนข้อความด้วย component จริง)
  const cols = COLUMNS.length;
  const clear = () => dispatch({ type: 'reset' });

  // เลือกเนื้อตารางตามสถานะ
  function renderBody() {
    switch (query.status) {
      case 'loading':
        return <LoadingRows rows={filters.pageSize} />;
      case 'empty':
        // ไม่มีข้อมูลเลยตั้งแต่ต้น
        return <EmptyState colSpan={cols} variant="no-data" onClear={clear} />;
      case 'error':
        return <ErrorState colSpan={cols} message={query.message} onRetry={retry} />;
      case 'success':
        // มีข้อมูล แต่กรองแล้วไม่เหลือ → Empty แบบ filtered
        if (filtered.length === 0) {
          return <EmptyState colSpan={cols} variant={isFiltered(filters) ? 'filtered' : 'no-data'} onClear={clear} />;
        }
        return undefined; // undefined = ให้ DataTable แสดงแถวข้อมูลเอง
      default: {
        // ถ้า Query มีสถานะใหม่แต่ไม่ได้เขียน case → compile fail
        const _exhaustive: never = query;
        return _exhaustive;
      }
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <OrdersToolbar filters={filters} counts={counts} dispatch={dispatch} />

      <DataTable
        columns={COLUMNS}
        rows={page.rows}
        getRowId={(o) => o.id}
        selectedId={selectedId}
        onRowClick={(o) => setSelectedId(o.id)} // ขั้นที่ 8 จะใช้ id นี้เปิด drawer
        body={renderBody()}
      />

      <Pagination
        page={page.page}
        pageSize={filters.pageSize}
        total={page.total}
        totalPages={page.totalPages}
        onPageChange={(p) => dispatch({ type: 'setPage', page: p })}
        onPageSizeChange={(n) => dispatch({ type: 'setPageSize', pageSize: n })}
      />
            {selectedOrder && <OrderDrawer order={selectedOrder} onClose={closeDrawer} />}
    </section>
  );
}