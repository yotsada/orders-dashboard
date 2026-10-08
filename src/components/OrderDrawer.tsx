// OrderDrawer — แผงรายละเอียดออเดอร์ เลื่อนจากขวา (อ่านอย่างเดียว)

import { Mail, Package, Phone, Printer, Truck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { formatBaht, formatDate, initials } from '../lib/format';
import { buildTimeline } from '../lib/timeline';
import type { Order } from '../types';
import { StatusBadge } from './StatusBadge';

const SHIPPING_SATANG = 0; // mock ไม่มีค่าส่ง → Total = ยอดสินค้า

// element ที่กด Tab ไปถึงได้ (ใช้ทำ focus trap)
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

interface Props {
  order: Order;
  onClose: () => void;
}

export function OrderDrawer({ order, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false); // ใช้เล่น animation เลื่อนเข้า

  // เปิด: ล็อก scroll + โฟกัสปุ่ม X + เริ่ม animation
  // ปิด (cleanup): ปลดล็อก scroll + คืน focus ไปที่แถวเดิม
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    const frame = requestAnimationFrame(() => setVisible(true));

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, []);

  // ปิดด้วย Esc
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // focus trap: Tab ที่ตัวสุดท้าย → วนไปตัวแรก, Shift+Tab ที่ตัวแรก → ไปตัวสุดท้าย
  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // คำนวณเป็นตัวเลข (สตางค์) ทั้งหมด แปลงเป็นบาทตอนแสดงผลเท่านั้น
  const subtotal = order.items.reduce((sum, i) => sum + i.quantity * i.unitPriceSatang, 0);
  const total = subtotal + SHIPPING_SATANG;
  const timeline = buildTimeline(order);

  // portal: render ไปที่ document.body นอก tree ของตาราง
  return createPortal(
    <div className="fixed inset-0 z-50 font-sans">
      {/* scrim: คลิกแล้วปิด */}
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onKeyDown={trapFocus}
        className={`fixed inset-y-0 right-0 flex w-full max-w-120 flex-col bg-white shadow-2xl transition-transform duration-200 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* หัว drawer */}
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 id="drawer-title" className="text-lg font-semibold text-slate-900">{order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {/* Customer */}
          <section>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">Customer</h3>
            <a
              href={`/customers?email=${encodeURIComponent(order.customer.email)}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
            >
              <span className="grid size-10 place-items-center rounded-full bg-indigo-50 text-sm font-medium text-indigo-600">
                {initials(order.customer.name)}
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-medium text-slate-900">{order.customer.name}</p>
                <p className="flex items-center gap-1.5 text-slate-500"><Mail className="size-3.5" />{order.customer.email}</p>
                <p className="flex items-center gap-1.5 text-slate-500"><Phone className="size-3.5" />{order.customer.phone}</p>
              </div>
            </a>
          </section>

          {/* Items */}
          <section>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">Items</h3>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.productName} className="flex items-center gap-3 py-3 text-sm">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100">
                    <Package className="size-5 text-slate-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{item.productName}</p>
                    <p className="text-slate-500">{item.quantity} × {formatBaht(item.unitPriceSatang)}</p>
                  </div>
                  <p className="font-medium text-slate-900 tabular-nums">{formatBaht(item.quantity * item.unitPriceSatang)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd className="tabular-nums">{formatBaht(subtotal)}</dd></div>
              <div className="flex justify-between text-slate-500"><dt>Shipping</dt><dd>{SHIPPING_SATANG === 0 ? 'Free' : formatBaht(SHIPPING_SATANG)}</dd></div>
              <div className="flex justify-between font-semibold text-slate-900"><dt>Total</dt><dd className="tabular-nums">{formatBaht(total)}</dd></div>
            </dl>
          </section>

          {/* Timeline: สี/ข้อความขึ้นกับ step.state ('done' | 'todo') */}
          <section>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">Timeline</h3>
            <ol className="space-y-4">
              {timeline.map((step) => (
                <li key={step.label} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                      step.state === 'done' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                    }`}
                  />
                  <div>
                    <p className={step.state === 'done' ? 'font-medium text-slate-900' : 'text-slate-400'}>{step.label}</p>
                    {/* at มีเฉพาะ step ที่ done — TypeScript รู้เองหลังเช็ก state */}
                    {step.state === 'done' && <p className="text-xs text-slate-500">{formatDate(step.at)}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ปุ่มท้าย: กว้างเท่ากัน (grid 2 คอลัมน์) · ฉบับนี้อ่านอย่างเดียว จึง disabled */}
        <footer className="grid grid-cols-2 gap-3 border-t border-slate-200 px-6 py-4">
          <button disabled title="Read-only in this version" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50">
            <Printer className="size-4" /> Print invoice
          </button>
          <button disabled title="Read-only in this version" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white disabled:opacity-50">
            <Truck className="size-4" /> Mark as shipped
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}