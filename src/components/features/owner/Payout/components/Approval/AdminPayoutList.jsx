"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert, confirmAlert } from "@/lib/alert";
import { formatIsoIndo, formatRupiah } from "@/utils/date";
import AdminPayoutDetailModal from "./AdminPayoutDetailModal";
import { useState } from "react";
import { 
  adminGetPayoutList,
  adminApprovePayout,
  adminRejectPayout 
} from "@/lib/payoutApi";

export default function AdminPayoutList() {
  const { data, mutate } = useSWR("/admin/payout", adminGetPayoutList);
  const [selected, setSelected] = useState(null);

  const handleApprove = async (id) => {
    const ok = await confirmAlert({
      title: "Approve Payout?",
      text: "Dana akan dikirim ke rekening promotor.",
    });
    if (!ok.isConfirmed) return;

    try {
      await adminApprovePayout(id);
      successAlert("Berhasil", "Payout disetujui");
      mutate();
    } catch (err) {
      errorAlert("Gagal", err.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    const ok = await confirmAlert({
      title: "Tolak Payout?",
      text: "Saldo akan dikembalikan ke promotor.",
    });
    if (!ok.isConfirmed) return;

    try {
      await adminRejectPayout(id);
      successAlert("Ditolak", "Payout telah ditolak");
      mutate();
    } catch (err) {
      errorAlert("Gagal", err.response?.data?.message);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-4">

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Creator</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Created At</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="p-2">{row.creator?.name}</td>
              <td className="p-2">{formatRupiah(row.amount)}</td>

              <td className="p-2">
                <span className="px-2 py-1 rounded text-xs bg-slate-100">
                  {row.status}
                </span>
              </td>

              <td className="p-2">{formatIsoIndo(row.created_at)}</td>

              <td className="p-2 flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelected(row.id)}>
                  Detail
                </Button>

                {row.status === "REQUESTED" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(row.id)}>
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(row.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL MODAL */}
      {selected && (
        <AdminPayoutDetailModal payoutId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
