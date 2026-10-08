# Orders Dashboard — Frontend (ส่วน A)

หน้า Orders สำหรับ Dev Test v1.2 · React + TypeScript + Tailwind CSS v4 · ข้อมูลจาก mock `fetchOrders()`

## รัน (3 คำสั่ง)

```bash
npm install
npm run dev      # เปิด http://localhost:5173
npm test         # unit test กรณี Error
```

ต้องใช้ Node.js 20.19 ขึ้นไป

## ทดลองแต่ละสถานะ

| URL | ผลที่เห็น |
|---|---|
| `/` | โหลด (skeleton) → ตาราง 40 ออเดอร์ |
| `/?mock=error` | หน้า Error + ปุ่ม Retry |
| `/?mock=empty` | หน้า Empty แบบ "ไม่มีข้อมูลเลย" |
| เลือก tab Paid + select Cancelled | หน้า Empty แบบ "กรองแล้วไม่เจอ" + ปุ่ม Clear filters |

## โครงไฟล์

```
src/
  types.ts                  Order, OrderStatus, Query, Filters, DEFAULT_FILTERS
  mock/orders.ts            mock 40 ออเดอร์ + fetchOrders() + MockApiError
  state/filters.ts          reducer ของ filter + กรอง/เรียง/แบ่งหน้า/นับ tab
  hooks/useOrders.ts        โหลดข้อมูล → Query + retry + กัน race condition
  lib/format.ts             จัดรูปเงิน (สตางค์ → บาท), วันที่, ชื่อย่อ
  lib/timeline.ts           สร้าง timeline ของออเดอร์
  components/
    DataTable.tsx           ตาราง generic <T> (column key: keyof T)
    OrdersTable.tsx         ประกอบ filter + ข้อมูล + ตาราง + drawer
    OrdersToolbar.tsx       ค้นหา, tab สถานะ, select
    Pagination.tsx          rows-per-page + เปลี่ยนหน้า
    TableStates.tsx         Loading / Empty / Error
    OrderDrawer.tsx         drawer รายละเอียด (portal, focus trap)
    StatusBadge.tsx         ป้ายสถานะ
    layout/Sidebar.tsx, layout/Header.tsx
    OrdersTable.test.tsx    unit test กรณี Error
```

## คำสั่งอื่น

```bash
npm run build    # type-check + build
npm run lint     # oxlint
```

## ขอบเขต

- ทำครบส่วนบังคับ: ตาราง (ค้นหา, tab, select, แบ่งหน้า), drawer อ่านอย่างเดียว, Loading/Empty/Error + Retry, unit test
- ยังไม่ทำ (โบนัส): Mobile, เรียงคอลัมน์, checkbox หลายแถว, filter ใน URL, KPI
