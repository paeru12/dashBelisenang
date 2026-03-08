"use client";

import useSWR from "swr";
import { getScanAssignments, acceptScanAssignment } from "@/lib/scanStaffApi";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  confirmAlert,
  successAlert,
  errorAlert,
} from "@/lib/alert";

const fetcher = async () => {
  const res = await getScanAssignments();
  return res.data.data;
};

export default function ScanStaffDashboard() {

  const router = useRouter();

  const { data: events, mutate, isLoading } = useSWR(
    "scan-assignments",
    fetcher,
    {
      refreshInterval: 10000, // realtime refresh tiap 10 detik
    }
  );

  async function handleAccept(id) {

    const confirm = await confirmAlert({
      title: "Terima Penugasan?",
      text: "Anda akan ditugaskan sebagai petugas scan pada event ini.",
      confirmText: "Terima",
    });

    if (!confirm.isConfirmed) return;

    try {

      await acceptScanAssignment(id);

      await successAlert(
        "Berhasil",
        "Assignment berhasil diterima"
      );

      mutate(); // refresh data realtime

    } catch (err) {

      errorAlert(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan"
      );

    }
  }

  if (isLoading) {

    return (
      <div className="text-sm text-slate-500">
        Loading assignments...
      </div>
    );

  }

  return (

    <div className="space-y-6">

      <h1 className="text-xl font-bold">
        Assigned Events
      </h1>

      {!events || events.length === 0 && (

        <div className="text-sm text-slate-500">
          Belum ada event yang ditugaskan
        </div>

      )}

      <div className="grid gap-4">

        {events?.map((item) => (

          <div
            key={item.id}
            className="bg-white border rounded-xl p-5 flex justify-between items-center hover:shadow transition"
          >

            <div>

              <h3 className="font-semibold capitalize">
                {item.event.name}
              </h3>

              <div className="text-sm text-slate-500 flex gap-4 mt-1">

                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {item.event.date_start}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {item.assigned_gate}
                </span>

              </div>

              {/* STATUS BADGE */}

              <div className="mt-2">

                {item.status === "pending" && (

                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    pending
                  </span>

                )}

                {item.status === "accepted" && (

                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    accepted
                  </span>

                )}

              </div>

            </div>

            <div>

              {item.status === "pending" ? (

                <Button
                  onClick={() => handleAccept(item.id)}
                >
                  Accept
                </Button>

              ) : (

                <Button
                  onClick={() =>
                    router.push(`/scan/${item.event_id}`)
                  }
                >
                  Start Scan
                </Button>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}