// Sidebar — เมนูด้านซ้าย กว้าง 256 (w-64) · ซ่อนบนจอเล็ก (hidden lg:flex)

import { ChartColumn, LayoutDashboard, Package, ShoppingCart, Store, Users } from 'lucide-react';

// เมนู 5 รายการ · Orders เป็นหน้าปัจจุบัน
const MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#' },
  { label: 'Orders', icon: ShoppingCart, href: '#', active: true },
  { label: 'Products', icon: Package, href: '#' },
  { label: 'Customers', icon: Users, href: '#' },
  { label: 'Analytics', icon: ChartColumn, href: '#' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* โลโก้ */}
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
          <Store className="size-4" />
        </span>
        <span className="text-base font-semibold text-slate-900">Shopdesk</span>
      </div>

      {/* เมนู · aria-current บอก screen reader ว่าอยู่หน้าไหน */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {MENU.map(({ label, icon: Icon, href, active }) => (
          <a
            key={label}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="size-5" />
            {label}
          </a>
        ))}
      </nav>

      {/* การ์ดผู้ใช้ด้านล่าง */}
      <div className="m-3 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
        <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">YP</span>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-slate-900">Yotsada P.</p>
          <p className="truncate text-xs text-slate-500">Admin</p>
        </div>
      </div>
    </aside>
  );
}