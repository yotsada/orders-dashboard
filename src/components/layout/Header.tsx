// Header — แถบบนสูง 64 (h-16): ช่วงวันที่, กระดิ่งแจ้งเตือน, avatar

import { Bell, Calendar, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-8">
      {/* ปุ่มเลือกช่วงวันที่ (แสดงผลอย่างเดียวในฉบับนี้) */}
      <button className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50">
        <Calendar className="size-4 text-slate-500" />
        Last 30 days
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {/* กระดิ่ง + จุดแดง */}
      <button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
        <Bell className="size-5" />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>

      <span className="grid size-9 place-items-center rounded-full bg-indigo-50 text-sm font-medium text-indigo-600">YP</span>
    </header>
  );
}