// =============================================================
// filters.ts — จัดการ "สถานะของตัวกรอง" ทั้งหมดของตาราง Orders
// และฟังก์ชันคำนวณข้อมูลที่ได้จากตัวกรอง (filter / sort / slice)
//
// ทำไมแยกไฟล์นี้ออกมา?
//  - logic ทั้งหมดเป็นฟังก์ชันล้วน (pure function) ไม่ยุ่งกับ React
//    → เทสง่าย, อ่านง่าย, อธิบายง่าย
//  - component จะแค่ "เรียกใช้" ไม่ต้องรู้ว่ากรองยังไง
// =============================================================

import { DEFAULT_FILTERS, ORDER_STATUSES } from '../types';
import type { Filters, Order, OrderStatus } from '../types';

// -------------------------------------------------------------
// 1) Action — "คำสั่ง" ที่ส่งเข้า reducer เพื่อเปลี่ยน filter
//
// เป็น discriminated union: ทุก action มี field `type` ไว้แยกชนิด
// และแต่ละชนิดมี payload ของตัวเอง เช่น setQuery ต้องมี q: string
// → ถ้า dispatch ผิดรูป (เช่น { type: 'setPage', page: 'abc' })
//   TypeScript จะแดงทันที
// -------------------------------------------------------------
export type FiltersAction =
  | { type: 'setQuery'; q: string }
  | { type: 'setTab'; tab: Filters['tab'] }
  | { type: 'setStatus'; status: Filters['status'] }
  | { type: 'setPage'; page: number }
  | { type: 'setPageSize'; pageSize: number }
  | { type: 'reset' };

// -------------------------------------------------------------
// 2) Reducer — รับ state เดิม + action → คืน state ใหม่
//
// กฎสำคัญจากโจทย์: "เปลี่ยน filter แล้วต้องกลับไปหน้า 1"
// เราใส่ page: 1 ไว้ใน reducer จุดเดียว ไม่ต้องไปจำใส่ในทุก component
//
// ทำไมใช้ useReducer แทน useState หลายตัว?
//  - Clear filters ต้อง reset ทุกค่า "ในครั้งเดียว" → แค่ return DEFAULT_FILTERS
//  - ถ้าใช้ useState 5 ตัว ต้องเรียก set 5 ครั้ง ลืมตัวเดียวก็บั๊ก
// -------------------------------------------------------------
export function filtersReducer(state: Filters, action: FiltersAction): Filters {
  switch (action.type) {
    case 'setQuery':
      return { ...state, q: action.q, page: 1 };
    case 'setTab':
      return { ...state, tab: action.tab, page: 1 };
    case 'setStatus':
      return { ...state, status: action.status, page: 1 };
    case 'setPageSize':
      return { ...state, pageSize: action.pageSize, page: 1 };
    case 'setPage':
      // เปลี่ยนหน้าอย่างเดียว ไม่ reset อะไร
      return { ...state, page: action.page };
    case 'reset':
      // DEFAULT_FILTERS มาจาก types.ts — ค่าเดียวกับตอนเริ่มต้นแอป
      return DEFAULT_FILTERS;
    default: {
      // exhaustive check: ถ้าวันหน้าเพิ่ม action ใหม่แต่ลืมเขียน case
      // บรรทัดนี้จะ compile ไม่ผ่าน เพราะ action จะไม่ใช่ never
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// -------------------------------------------------------------
// 3) isFiltered — ผู้ใช้ "กรองอะไรอยู่ไหม"
//
// ใช้ตอนข้อมูลว่าง เพื่อแยก 2 กรณีตามโจทย์:
//  - กรองอยู่แล้วไม่เจอ   → "No orders match your filters" + ปุ่ม Clear filters
//  - ไม่มีข้อมูลเลยตั้งแต่ต้น → ข้อความอีกแบบ ไม่ต้องมีปุ่ม Clear
// -------------------------------------------------------------
export function isFiltered(f: Filters): boolean {
  return f.q.trim() !== '' || f.tab !== 'all' || f.status !== 'all';
}

// -------------------------------------------------------------
// 4) matchesQuery — ช่องค้นหา
// ค้นใน เลขออเดอร์ / ชื่อลูกค้า / อีเมล แบบไม่สนตัวพิมพ์เล็ก-ใหญ่
// -------------------------------------------------------------
function matchesQuery(order: Order, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle === '') return true; // ไม่ได้พิมพ์อะไร = ผ่านหมด
  return [order.id, order.customer.name, order.customer.email].some((text) =>
    text.toLowerCase().includes(needle),
  );
}

// -------------------------------------------------------------
// 5) filterOrders — กรอง + เรียง (ยังไม่แบ่งหน้า)
//
// tab กับ select เป็นตัวกรองสถานะทั้งคู่ → ใช้แบบ AND
// (ตัวอย่างในโจทย์: tab Cancelled + select Cancelled)
//
// [...orders] = copy array ก่อน sort เพราะ .sort() แก้ array เดิม
// ถ้าไม่ copy จะไปแก้ MOCK_ORDERS ตรงๆ (บั๊กที่ AI ชอบทำ)
// -------------------------------------------------------------
export function filterOrders(orders: Order[], f: Filters): Order[] {
  return [...orders]
    .filter((o) => matchesQuery(o, f.q))
    .filter((o) => f.tab === 'all' || o.status === f.tab)
    .filter((o) => f.status === 'all' || o.status === f.status)
    // ISO 8601 UTC เรียงแบบ string ได้ถูกต้องเลย (ปี-เดือน-วัน-เวลา)
    // b ก่อน a = ใหม่ → เก่า
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// -------------------------------------------------------------
// 6) paginate — ตัดเอาเฉพาะแถวของหน้าปัจจุบัน
//
// คืนทั้งแถวที่จะแสดง + ข้อมูลไว้ทำ footer ("1–8 of 40", ปุ่มหน้า)
// Math.max(1, ...) กัน totalPages เป็น 0 ตอนไม่มีข้อมูล
// -------------------------------------------------------------
export interface Page<T> {
  rows: T[];
  total: number;
  totalPages: number;
  page: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages); // กันหน้าเกินขอบ
  const start = (safePage - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    total: items.length,
    totalPages,
    page: safePage,
  };
}

// -------------------------------------------------------------
// 7) countByStatus — ตัวเลขบน tab (ห้าม hardcode ตามโจทย์)
//
// นับจากข้อมูลที่ผ่าน "ช่องค้นหา" แล้ว แต่ไม่สน tab/select
// → พิมพ์ค้นหา "aom" แล้วตัวเลขทุก tab จะลดตามไปด้วย
//   แต่การกด tab ไม่ทำให้ตัวเลข tab อื่นกลายเป็น 0
// -------------------------------------------------------------
export function countByStatus(orders: Order[], q: string): Record<OrderStatus | 'all', number> {
  const matched = orders.filter((o) => matchesQuery(o, q));

  // เริ่มทุกสถานะที่ 0 ก่อน เพื่อให้ tab ที่ไม่มีข้อมูลแสดง 0 ไม่ใช่ undefined
  const counts = { all: matched.length } as Record<OrderStatus | 'all', number>;
  for (const s of ORDER_STATUSES) counts[s] = 0;
  for (const o of matched) counts[o.status] += 1;

  return counts;
}