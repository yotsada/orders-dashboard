# SPEC — Frontend: Orders Dashboard (ส่วน A)

> ที่มา: Dev Test — Orders Dashboard v1.2 ฉบับครึ่งวัน · เวลา 4 ชั่วโมง
> Figma: https://www.figma.com/design/xX7nsbZePDbsynxxXCTVwf
> Stack: React + TypeScript + Tailwind CSS · icon: `lucide-react`

---

## 1. ขอบเขต

### ✅ บังคับ (ต้องเสร็จใน 4 ชม.)
| # | งาน | หัวข้อในไฟล์นี้ |
|---|-----|----------------|
| 1 | ตาราง Desktop: ค้นหา + tab สถานะ + แบ่งหน้า | §4 |
| 2 | Drawer รายละเอียดออเดอร์ (อ่านอย่างเดียว) | §5 |
| 3 | สถานะ Loading / Empty / Error + ปุ่ม Retry | §6 |
| 4 | ข้อมูลจาก mock `fetchOrders()` | §3 |
| 5 | Unit test 1 ข้อ (กรณี Error) | §7 |
| 6 | README (รันได้ใน ≤ 3 คำสั่ง) + `AI_NOTES.md` | ดู CLAUDE.md |

### ⭐ โบนัส (ทำหลังบังคับเสร็จเท่านั้น · ได้สูงสุด +10)
- หน้า Mobile 390 (§8)
- เรียงคอลัมน์ (sort)
- Checkbox เลือกหลายแถว (หัวตารางเลือกทั้งหน้า)
- เก็บ filter ใน URL query string
- KPI 4 การ์ดคำนวณจากข้อมูลจริง

> ⚠️ ในเอกสารต้นฉบับหน้า 2–7 มีข้อกำหนดของโบนัสปนอยู่ในหัวข้อ "สิ่งที่ใช้วัด" — ยึดตารางนี้เป็นหลัก

---

## 2. Data Model (TypeScript)

```ts
type OrderStatus = 'paid' | 'pending' | 'shipped' | 'cancelled' | 'refunded'; // union ปิด

interface Customer { name: string; email: string; phone: string }

interface LineItem {
  productName: string;
  quantity: number;
  unitPriceSatang: number; // integer สตางค์
  imageUrl?: string;
}

type TimelineStep =
  | { state: 'done'; label: string; at: string }
  | { state: 'todo'; label: string };

interface Order {
  id: string;            // "ORD-10478"
  status: OrderStatus;
  customer: Customer;
  items: LineItem[];
  totalSatang: number;   // integer
  createdAt: string;     // ISO 8601 UTC
}

type Query =
  | { status: 'loading' }
  | { status: 'success'; data: Order[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

interface Filters { q: string; tab: OrderStatus | 'all'; status: OrderStatus | 'all'; page: number; pageSize: number }
const DEFAULT_FILTERS = { q: '', tab: 'all', status: 'all', page: 1, pageSize: 8 } as const satisfies Filters;
```

กฎ TypeScript:
- Status badge รับ `OrderStatus` เท่านั้น ห้ามรับ `string`
- Component ตารางเป็น generic `<T>` รับ column definition แบบ type-safe (`key: keyof T`)
- Render ตาม `Query.status` ด้วย `switch` แบบ exhaustive + `never` check (เพิ่มสถานะใหม่แล้วต้อง compile fail)
- ห้ามมี state ที่เป็นไปไม่ได้ (เช่น loading=true พร้อม error)
- ค่าที่ `catch` ได้เป็น `unknown` → ต้อง narrow ก่อนอ่าน `.message`
- คำนวณ Total เป็น number ห้ามต่อ string

---

## 3. Mock API

- `fetchOrders(filters?)` → `Promise<Order[]>` หน่วงเวลาสุ่ม 500–1000 ms
- Mock data อยู่ในโปรเจกต์ (array) — ไม่ต่อ API จริง
- เปิดหน้าด้วย `?mock=error` → reject ด้วย `class MockApiError extends Error { status: number }`
  - ข้อความตัวอย่าง: `GET /api/orders → 500`
- (Full-stack) สลับไปใช้ API จริงผ่าน `VITE_API_URL`

---

## 4. หน้า Desktop 1440 — Orders (Default)

**Layout**
- Sidebar กว้าง 256: โลโก้, เมนู 5 รายการ (Orders active), การ์ดผู้ใช้ด้านล่าง
- Header สูง 64: ช่องค้นหา, ปุ่มช่วงวันที่, กระดิ่งมีจุดแดง, avatar
- KPI 4 ใบ: ยอดขาย, จำนวนออเดอร์, รอจัดส่ง, ลูกค้าใหม่ + % เทียบ 30 วัน (เขียวขึ้น/แดงลง) — *แสดงได้ แต่การคำนวณจริงเป็นโบนัส*
- ตาราง: tab สถานะพร้อมตัวเลข, select สถานะ, ปุ่ม Filters, 8 แถว/หน้า, footer มี rows-per-page + pagination

**พฤติกรรม (บังคับ)**
- ค้นหา + tab + select + แบ่งหน้า ต้องทำงานร่วมกันถูกต้อง (filter → slice ฝั่ง client จาก mock ทั้งชุด)
- เปลี่ยน filter ใด ๆ → กลับไปหน้า 1
- ตัวเลขใน tab คำนวณจาก mock ห้าม hardcode
- ใช้ `useMemo` กับ derived data
- เรียงใหม่→เก่า (createdAt desc) เป็นค่าเริ่มต้น

**Tailwind**
- Layout: `grid grid-cols-4` / `flex`
- ตาราง: `table-fixed` หรือ grid
- Hover `hover:bg-slate-50` · Selected `data-[state=selected]:bg-indigo-50`

---

## 5. Order Detail Drawer

**Layout**
- เปิดเมื่อคลิกแถว (หรือ icon ตา) · กว้าง 480 จากขอบขวา · scrim สีเข้มโปร่ง 40%
- ส่วน Customer: ชื่อ, อีเมล, เบอร์ (ลิงก์ไปหน้าลูกค้า)
- ส่วน Items: รูป, ชื่อ, จำนวน × ราคา, ยอดต่อรายการ → Subtotal / Shipping / Total
- ส่วน Timeline: สั่งซื้อ → ยืนยันชำระเงิน (done = สีม่วง) → จัดส่ง (todo = วงกลมขาว)
- ปุ่มท้าย: Print invoice (รอง) + Mark as shipped (หลัก) กว้างเท่ากัน — *ฉบับนี้อ่านอย่างเดียว*

**พฤติกรรม**
- Render ผ่าน `createPortal` นอก tree ของตาราง
- ปิดได้ 3 ทาง: ปุ่ม X, `Esc`, คลิก scrim
- เปิดอยู่: ล็อก scroll หน้าหลัก + focus trap ใน drawer
- ข้อมูลอ้างจาก `selectedOrderId` ไม่ copy object
- A11y (ได้คะแนนเพิ่ม): `role="dialog"`, `aria-modal="true"`, คืน focus ไปแถวเดิมเมื่อปิด

**Tailwind**
- `fixed inset-y-0 right-0 w-120 shadow-2xl` (480px) · scrim `bg-slate-900/40`
- Transition `translate-x-full` → `translate-x-0`

---

## 6. สถานะของตาราง

> ทุกสถานะ: toolbar (tab, select, ปุ่ม) และหัวตารางต้องยังแสดงอยู่

### 6.1 Loading
- เนื้อตารางเป็น skeleton ตำแหน่งตรงข้อมูลจริง: checkbox, เลขออเดอร์, avatar กลม + ชื่อ 2 บรรทัด, badge, ยอดเงิน, วันที่, footer
- จำนวนแถว skeleton = `pageSize` ปัจจุบัน (ค่าเริ่มต้น 8) ห้าม hardcode
- `animate-pulse` บน container เดียว · แท่ง `h-3 rounded bg-slate-100` ขนาดใกล้ข้อความจริง (กัน layout shift)

### 6.2 Empty
- ตัวอย่าง: tab Cancelled + select Cancelled แล้วไม่มีข้อมูล
- Icon กล่องจดหมายในวงกลมเทา · หัวข้อ "No orders match your filters" · คำอธิบายสั้น
- ปุ่ม: Clear filters (รอง) + New order (หลัก)
- ต้องแยก 2 กรณี ข้อความ/ปุ่มต่างกัน: **ไม่มีข้อมูลเลย** vs **กรองแล้วไม่เจอ**
- Clear filters → reset q, tab, select, page กลับ `DEFAULT_FILTERS` ในครั้งเดียว (`useReducer` หรือ state object เดียว)
- Tailwind: `flex flex-col items-center py-16 text-center` · ข้อความ `max-w-95` (380px) · icon `size-16 rounded-full bg-slate-100`

### 6.3 Error
- Icon สามเหลี่ยมเตือนสีแดงในวงกลม `bg-rose-50 text-rose-600`
- หัวข้อ "Couldn't load orders" · คำอธิบายบอกว่า filter ยังอยู่
- กล่องข้อความ error: `rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium` · ห้ามโชว์ stack trace
- ปุ่ม Retry ปุ่มเดียว:
  - เรียก `fetchOrders()` ใหม่ด้วย filter เดิม ไม่ reset หน้า
  - ระหว่าง retry → กลับไปแสดง Loading skeleton
- กัน race condition: ignore ผลของ Promise เก่าเมื่อ filter เปลี่ยน (flag ใน cleanup ของ `useEffect`) · ใช้ TanStack Query ได้แต่ไม่บังคับ

---

## 7. Test (บังคับ 1 ข้อ)
- Mock `fetchOrders()` ให้ reject → ตรวจว่า UI แสดงหน้า Error
- กด Retry → ตรวจว่า `fetchOrders` ถูกเรียกซ้ำ
- ต้องเทสโค้ดจริง ห้าม `expect(true).toBe(true)` หรือ mock ทุกอย่างจนไม่ได้เทสอะไร

---

## 8. (โบนัส) Mobile 390
- Top bar 56: โลโก้, กระดิ่ง, avatar · ไม่มี sidebar
- หัวข้อ Orders + จำนวน + ปุ่ม New สั้น
- KPI เป็น grid 2×2 ตัด "vs last 30 days"
- ค้นหาเต็มความกว้าง + status chips เลื่อนแนวนอน
- ตาราง → การ์ด (บน: เลขออเดอร์ + badge · ล่าง: ชื่อ + วันที่ + ยอด + ลูกศร)
- Load more แทน pagination (append ไม่ replace)
- Tab bar ล่าง 4 เมนู
- **โค้ดชุดเดียวกับ desktop** ผ่าน breakpoint: `grid-cols-2 lg:grid-cols-4`, `hidden lg:table`, `lg:hidden`, sidebar `hidden lg:flex`, chips `overflow-x-auto snap-x`
- แชร์ state filter และ type `Order` เดียวกัน · drawer ตัวเดียวกันแต่เต็มจอบนมือถือ

---

## 9. Design Tokens (จาก Figma Section 01)
- สี: ผูกกับ Variable collection `tailwind` เช่น `slate/500` → `text-slate-500`, `indigo/600` → `bg-indigo-600`
- ฟอนต์ Inter · ขนาด 12/13/14/15/18/22/24/28 (`text-xs` … `text-3xl`)
- Spacing พหุคูณของ 4 (4, 8, 12, 16, 24, 32)
- Icon: lucide ชื่อตรงกับ Figma `Icon/<name>` เช่น `Icon/search` → `Search`, `Icon/shopping-cart` → `ShoppingCart` · stroke 1.8 · 24×24
