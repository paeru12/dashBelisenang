"use client";

import SectionCard from "@/components/common/SectionCard";
import { usePayoutHistory } from "@/hooks/usePayout";
import { formatIsoIndo, formatRupiah } from "@/utils/date";

export default function HistoryTable() {
  const { history, loading } = usePayoutHistory();

  if (loading) return <p>Loading...</p>;
  if (!history || history.length === 0)
    return (
      <SectionCard title="Riwayat Payout">
        <p className="text-sm text-slate-500">Belum ada riwayat payout.</p>
      </SectionCard>
    );

  const badge = (status) => {
    const base = "px-2 py-1 text-xs rounded";
    switch (status) {
      case "COMPLETED":
        return `${base} bg-green-100 text-green-700`;
      case "PENDING":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "APPROVED":
        return `${base} bg-blue-100 text-blue-700`;
      case "FAILED":
        return `${base} bg-red-100 text-red-700`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <SectionCard title="Riwayat Payout">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Tanggal Request</th>
            <th className="p-2 text-left">Jumlah</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Approved At</th>
          </tr>
        </thead>

        <tbody>
          {history.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="p-2">{formatIsoIndo(row.created_at)}</td>
              <td className="p-2">{formatRupiah(row.amount)}</td>

              <td className="p-2">
                <span className={badge(row.status)}>
                  {row.status}
                </span>
              </td>

              <td className="p-2">
                {row.approved_at ? formatIsoIndo(row.approved_at) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}
