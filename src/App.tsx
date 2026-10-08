// App — โครงหน้า: Sidebar (ซ้าย) + Header (บน) + เนื้อหา

import { Plus } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OrdersTable } from './components/OrdersTable';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      {/* เว้นซ้าย 256 ให้ sidebar เฉพาะจอใหญ่ */}
      <div className="lg:pl-64">
        <Header />

        <main className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
              <p className="mt-1 text-sm text-slate-500">Manage and track customer orders.</p>
            </div>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="size-4" />
              New order
            </button>
          </div>

          <OrdersTable />
        </main>
      </div>
    </div>
  );
}