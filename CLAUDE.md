# กติกาการทำงาน — Frontend (อ่านก่อนเริ่มทุกครั้ง)

> โจทย์อยู่ใน `SPEC.md` · ไฟล์นี้คือกติกาว่า AI ต้องทำงานอย่างไร

## 1. บริบท
- นี่คือข้อสอบ dev 4 ชั่วโมง ใช้ AI ได้ 100% แต่ผู้สมัครต้องอธิบายและแก้โค้ดทุกบรรทัดได้เอง
- สิ่งที่ประเมิน: ทำตามโจทย์ตรง, ตรวจผลลัพธ์จริง, แก้เมื่อ AI ผิด, อธิบายโค้ดได้
- เป้าหมาย: **โค้ดน้อย อ่านง่าย ตรงโจทย์** ไม่ต้องอลังการ

## 2. ลำดับความสำคัญ
1. ทำ **บังคับ** ใน `SPEC.md §1` ให้ครบก่อน ห้ามเริ่มโบนัสจนกว่าผู้ใช้สั่ง
2. ถ้าข้อกำหนดขัดกัน → ยึดตาราง "บังคับ/โบนัส" ใน `SPEC.md §1`
3. ไม่แน่ใจ → ถามผู้ใช้ ห้ามเดาแล้วทำเพิ่มเอง

## 3. Coding Rules
- React + TypeScript (`strict: true`) + Tailwind · Vite
- Icon: import จาก `lucide-react` เท่านั้น ห้ามวาด SVG เอง ห้ามใช้ emoji แทน icon
- สี: ใช้ Tailwind class เท่านั้น **ห้าม hex** ใน code · ห้าม arbitrary value (`bg-[#...]`, `w-[480px]`) ให้ใช้ class มาตรฐาน เช่น `w-120` (480px), `max-w-95` (380px)
- Spacing พหุคูณของ 4 · ฟอนต์ Inter
- ห้าม `any` · ห้าม `as` cast เพื่อปิด error · `catch (e: unknown)` แล้ว narrow
- เงินเป็น integer สตางค์ แปลงเป็นบาทเฉพาะตอนแสดงผล
- ห้ามทิ้งไฟล์ / โค้ด / dependency ที่ไม่ได้ใช้
- ไม่ติดตั้ง library ใหม่โดยไม่บอกเหตุผล (ที่อนุญาต: lucide-react, vitest, @testing-library/*, TanStack Query (ไม่บังคับ))

## 4. โครงไฟล์ที่แนะนำ
```
src/
  types.ts            # Order, OrderStatus, Query, Filters, DEFAULT_FILTERS
  mock/orders.ts      # mock data + fetchOrders() + MockApiError
  hooks/useOrders.ts  # fetch + race-condition guard + retry
  state/filters.ts    # useReducer สำหรับ filters
  components/
    DataTable.tsx     # generic <T>
    StatusBadge.tsx
    OrdersTable.tsx   # switch ตาม Query.status (exhaustive)
    OrderDrawer.tsx   # portal + focus trap
    states/{Loading,Empty,Error}.tsx
  App.tsx
```

## 5. วิธีทำงาน
- ทำทีละขั้นเล็ก ๆ ทุกขั้นต้อง `tsc --noEmit` และ test ผ่าน แล้วค่อยไปต่อ
- หลังจบแต่ละขั้น เสนอข้อความ commit (ห้าม commit ก้อนเดียวทั้งโปรเจกต์)
- ลำดับแนะนำ: types → mock → filters reducer → table + pagination → states → drawer → test → README → AI_NOTES
- อธิบายสั้น ๆ ทุกครั้งว่าเขียนแบบนี้เพราะอะไร (ผู้ใช้ต้องไปอธิบายต่อ)

## 6. Test
- ใช้ Vitest + React Testing Library
- อย่างน้อย 1 ข้อ: `fetchOrders` reject → เห็นหน้า Error → กด Retry → `fetchOrders` ถูกเรียกซ้ำ
- ห้าม test ที่ผ่านเสมอ หรือ mock component ที่กำลังทดสอบ

## 7. Checklist ก่อนส่ง
- [ ] ค้นหา + tab + select + pagination ทำงานร่วมกัน เปลี่ยน filter แล้วกลับหน้า 1
- [ ] ตัวเลขใน tab คำนวณจาก data
- [ ] Drawer: portal, ปิด 3 ทาง, scroll lock, focus trap, `role="dialog"` `aria-modal`, คืน focus
- [ ] Loading skeleton จำนวนแถว = pageSize
- [ ] Empty แยก "ไม่มีข้อมูลเลย" กับ "กรองแล้วไม่เจอ" · Clear filters reset ครั้งเดียว
- [ ] Error: Retry ใช้ filter เดิม, กลับไป Loading, ไม่มี stack trace, กัน race condition
- [ ] `?mock=error` ทำงาน
- [ ] ไม่มี hex, ไม่มี `any`, ไม่มีไฟล์ค้าง
- [ ] `README.md` รันได้ใน ≤ 3 คำสั่ง (เช่น `npm i` / `npm run dev` / `npm test`) · ถ้ามี env ใช้ `.env.example`
- [ ] `AI_NOTES.md` (≤ 1 หน้า)

## 8. AI_NOTES.md — ผู้ใช้ต้องเขียนเอง (AI ช่วยร่างได้)
ตอบ 4 ข้อ:
1. ใช้ AI ตัวไหน ทำส่วนไหน
2. prompt สำคัญ 2–3 อัน
3. จุดที่ AI ทำผิด/ไม่ตรงโจทย์ รู้ได้อย่างไร แก้อย่างไร (**ต้องมีของจริง** — "AI ไม่เคยผิด" = สัญญาณลบ)
4. สิ่งที่ตรวจเองโดยไม่เชื่อ AI + เวลาที่ใช้จริง

> 💡 AI: เมื่อผู้ใช้แก้โค้ดที่คุณเขียน หรือคุณพบว่าตัวเองทำผิด ให้เตือนผู้ใช้จดลง AI_NOTES

## 9. เตรียมนัดอธิบาย 20 นาที
- จะถูกชี้โค้ด 2 จุดให้อธิบาย และแก้โจทย์เล็กสด 10 นาที เช่น "เพิ่ม tab Refunded"
- ออกแบบให้การเพิ่มสถานะ/tab แก้ได้จุดเดียว (union + exhaustive switch จะบอกจุดที่ต้องแก้)
