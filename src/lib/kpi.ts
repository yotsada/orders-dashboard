// kpi — คำนวณ KPI 4 ใบจากข้อมูลจริง + % เทียบ 30 วันก่อนหน้า

import type { Order } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const PERIOD = 30 * DAY;

export interface Kpi {
  label: string;
  value: number;
  change: number | null; // % เทียบช่วงก่อน · null = ช่วงก่อนเป็น 0 (หารไม่ได้)
  format: 'baht' | 'number';
}

// % เปลี่ยนแปลง (ปัดทศนิยม 1 ตำแหน่ง)
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ยอดขาย = เฉพาะออเดอร์ที่จ่ายเงินแล้วและไม่ถูกคืนเงิน
const isRevenue = (o: Order) => o.status === 'paid' || o.status === 'shipped';

export function computeKpis(orders: Order[]): Kpi[] {
  if (orders.length === 0) return [];

  // จุดอ้างอิง = ออเดอร์ล่าสุดในข้อมูล (mock เป็นข้อมูลนิ่ง ถ้าใช้ Date.now() ตัวเลขจะเปลี่ยนทุกวัน)
  const end = Math.max(...orders.map((o) => Date.parse(o.createdAt)));
  const inRange = (o: Order, from: number, to: number) => {
    const t = Date.parse(o.createdAt);
    return t > from && t <= to;
  };
  const current = orders.filter((o) => inRange(o, end - PERIOD, end));
  const previous = orders.filter((o) => inRange(o, end - 2 * PERIOD, end - PERIOD));

  // ลูกค้าใหม่ = ลูกค้าที่ "ออเดอร์แรก" อยู่ในช่วงนั้น (ระบุลูกค้าด้วยอีเมล)
  const firstOrderAt = new Map<string, number>();
  for (const o of orders) {
    const t = Date.parse(o.createdAt);
    const prev = firstOrderAt.get(o.customer.email);
    if (prev === undefined || t < prev) firstOrderAt.set(o.customer.email, t);
  }
  const newCustomers = (from: number, to: number) =>
    [...firstOrderAt.values()].filter((t) => t > from && t <= to).length;

  const sum = (list: Order[]) => list.filter(isRevenue).reduce((s, o) => s + o.totalSatang, 0);
  const awaiting = (list: Order[]) => list.filter((o) => o.status === 'paid').length; // จ่ายแล้ว ยังไม่ส่ง

  const cur = {
    revenue: sum(current),
    orders: current.length,
    awaiting: awaiting(current),
    customers: newCustomers(end - PERIOD, end),
  };
  const prev = {
    revenue: sum(previous),
    orders: previous.length,
    awaiting: awaiting(previous),
    customers: newCustomers(end - 2 * PERIOD, end - PERIOD),
  };

  return [
    { label: 'Total revenue', value: cur.revenue, change: percentChange(cur.revenue, prev.revenue), format: 'baht' },
    { label: 'Orders', value: cur.orders, change: percentChange(cur.orders, prev.orders), format: 'number' },
    { label: 'Awaiting shipment', value: cur.awaiting, change: percentChange(cur.awaiting, prev.awaiting), format: 'number' },
    { label: 'New customers', value: cur.customers, change: percentChange(cur.customers, prev.customers), format: 'number' },
  ];
}