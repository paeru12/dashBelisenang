"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { getScanAssignments } from "@/lib/scanStaffApi";

const fetcher = async () => {
  const res = await getScanAssignments();
  return res.data.data;
};

export default function EventSelector() {

  const router = useRouter();

  const { data: events, isLoading } = useSWR(
    "scan-assignments",
    fetcher
  );

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (

    <div className="max-w-lg mx-auto">

      {/* HEADER */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">
          Select Event
        </h2>

        <p className="text-sm text-slate-500">
          Pilih event sebelum scan tiket
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {events?.map((item) => (

          <button
            key={item.id}
            onClick={() =>
              router.push(`/scan/${item.id}`)
            }
            className="
              w-full text-left
              border rounded-xl p-4
              bg-white shadow-sm
              hover:shadow-md
              transition
            "
          >

            <h3 className="font-semibold capitalize">
              {item.event.name}
            </h3>

            <div className="flex gap-4 text-sm text-slate-500 mt-1">

              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {item.event.date_start}
              </span>

              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {item.assigned_gate}
              </span>

            </div>

          </button>

        ))}

      </div>

    </div>

  );
}