// KpiCards — การ์ด KPI 4 ใบ + % เทียบ 30 วันก่อน (เขียวขึ้น / แดงลง)

import { Clock, DollarSign, ShoppingCart, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';
import type { Kpi } from '../lib/kpi';
import { formatBaht } from '../lib/format';

// icon ต่อการ์ด (ลำดับเดียวกับ computeKpis)
const ICONS = [DollarSign, ShoppingCart, Clock, UserPlus];

export function KpiCards({ kpis, loading }: { kpis: Kpi[]; loading: boolean }) {
  // ระหว่างโหลด: การ์ด skeleton 4 ใบ ขนาดเท่าของจริง
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-4 gap-4 animate-pulse">
        {ICONS.map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-6 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (kpis.length === 0) return null; // ไม่มีข้อมูล = ไม่แสดงการ์ด

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = ICONS[i];
        const up = kpi.change !== null && kpi.change >= 0;
        return (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <Icon className="size-5 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
              {kpi.format === 'baht' ? formatBaht(kpi.value) : kpi.value.toLocaleString('en-US')}
            </p>
            {kpi.change === null ? (
              <p className="mt-1 text-xs text-slate-400">No data for previous period</p>
            ) : (
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {up ? '+' : ''}{kpi.change}%
                <span className="font-normal text-slate-400">vs last 30 days</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}