// timeline — สร้างลำดับสถานะของออเดอร์ สำหรับแสดงใน drawer

import type { Order, TimelineStep } from '../types';

const MIN = 60 * 1000;

// เลื่อนเวลาจาก createdAt (mock ไม่มีเวลาจริงของแต่ละขั้น)
const after = (iso: string, minutes: number) => new Date(new Date(iso).getTime() + minutes * MIN).toISOString();

export function buildTimeline(order: Order): TimelineStep[] {
  const paid = ['paid', 'shipped', 'refunded'].includes(order.status);
  const shipped = ['shipped', 'refunded'].includes(order.status);

  return [
    { state: 'done', label: 'Order placed', at: order.createdAt },
    paid
      ? { state: 'done', label: 'Payment confirmed', at: after(order.createdAt, 15) }
      : { state: 'todo', label: 'Payment confirmed' },
    shipped
      ? { state: 'done', label: 'Shipped', at: after(order.createdAt, 60 * 24) }
      : { state: 'todo', label: 'Shipped' },
  ];
}