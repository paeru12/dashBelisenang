// components/features/owner/Payout/components/BalanceCards.jsx
"use client";

import SectionCard from "@/components/common/SectionCard";
import { usePayoutDashboard } from "@/hooks/usePayout";
import { formatRupiah } from "@/utils/date";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BalanceCards() {
  const { dashboard, loading } = usePayoutDashboard();

  if (loading) return <p>Loading...</p>;

  const chartData = dashboard?.chart || [];

  return (
    <div className="space-y-6">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <SectionCard title="Saldo Aktif">
          <div className="text-2xl font-bold">
            {formatRupiah(dashboard.balance)}
          </div>
        </SectionCard>

        <SectionCard title="Total Payout">
          <div className="text-2xl font-bold">
            {formatRupiah(dashboard.total_payout)}
          </div>
        </SectionCard>

        <SectionCard title="Gross Revenue">
          <div className="text-2xl font-bold">
            {formatRupiah(dashboard.total_income)}
          </div>
        </SectionCard>


      </div>

      {/* CHART */}
      <SectionCard
        title="Pemasukan 30 Hari"
        description="Riwayat pemasukan transaksi tiket"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

    </div>
  );
}
