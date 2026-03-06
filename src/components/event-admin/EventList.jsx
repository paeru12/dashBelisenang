"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "@/utils/useDebounce";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

import { getEvents, deleteEvents } from "@/lib/eventApi";
import { formatEventDateTime, formatRupiah } from "@/utils/date";
import { confirmAlert, successAlert, errorAlert } from "@/lib/alert";

import { motion, AnimatePresence } from "framer-motion";

export default function EventList() {
  const router = useRouter();

  /* ===================== SEARCH (debounce) ===================== */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [activeStatus, setActiveStatus] = useState("published");
  const tabs = ["published", "draft", "ended"];

  /* ===================== SWR FETCH ===================== */
  const { data: res, error, isLoading, mutate } = useSWR(
    ["events", debouncedSearch],
    () => getEvents({ search: debouncedSearch }),
    { revalidateOnFocus: false }
  );

  const events = res?.events || [];
  const mediaBase = res?.media || "";

  /* ===================== FORMAT EVENT ===================== */
  const parsedEvents = useMemo(() => {
    return events.map((item) => ({
      ...item,
      tanggalPelaksanaan: formatEventDateTime({
        startDate: item.date_start,
        startTime: item.time_start,
        endDate: item.date_end,
        endTime: item.time_end,
        zone: item.timezone,
      }),
      image: item.image
        ? `${mediaBase}${item.image.replace(/^\/+/, "")}`
        : "",
      sold: item.ticket_types?.reduce(
        (a, b) => a + Number(b.ticket_sold || 0),
        0
      ),
      revenue: item.ticket_types?.reduce(
        (a, b) => a + Number(b.ticket_sold || 0) * Number(b.price || 0),
        0
      ),
    }));
  }, [events, mediaBase]);

  /* ===================== FILTER by STATUS ===================== */
  const filteredData = useMemo(() => {
    return parsedEvents.filter((item) => item.status === activeStatus);
  }, [parsedEvents, activeStatus]);

  /* ===================== DELETE ===================== */
  async function handleDeleteEvent(event) {
    const res = await confirmAlert({
      title: "Hapus Event?",
      text: `Event "${event.name}" akan dihapus permanen.`,
      confirmText: "Hapus",
      confirmColor: "#ef4444",
    });

    if (!res.isConfirmed) return;

    try {
      await deleteEvents(event.id);
      await successAlert("Berhasil", "Event berhasil dihapus");

      mutate(); // ♻️ AUTO REFRESH LIST
    } catch (e) {
      errorAlert("Gagal", e.message);
    }
  }

  /* ===================== UI ===================== */

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Events</h2>
        <Button onClick={() => router.push("/events/add")}>+ Add Event</Button>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* TABS */}
      <div className="relative flex gap-6 border-b mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className="relative pb-3 text-sm font-medium capitalize hover:cursor-pointer text-slate-600"
          >
            {tab}

            {activeStatus === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <EventListSkeleton />
      ) : filteredData.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Tidak ada event</div>
      ) : (
        <motion.div
          layout
          className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredData.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push(`/events/${row.id}/detail`)}
                className="bg-white hover:cursor-pointer rounded-2xl shadow-sm border hover:shadow-xl transition overflow-hidden group"
              >

                {/* IMAGE */}
                <div className="relative aspect-[1062/427] w-full overflow-hidden bg-slate-100">
                  {row.image ? (
                    <img
                      src={row.image}
                      alt={row.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No Image
                    </div>
                  )}

                  {/* STATUS BADGE */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium capitalize
                        ${
                          row.status === "draft"
                            ? "bg-red-100 text-red-600"
                            : row.status === "published"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-600"
                        }
                        `}
                    >
                      {row.status}
                    </span>
                  </div>

                  {/* QUICK STATS */}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
                    {row.sold} sold • Rp {formatRupiah(row.lowest_price)}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-base capitalize line-clamp-2">
                    {row.name}
                  </h3>

                  <div className="text-sm text-slate-500">{row.location}</div>

                  <div className="text-xs text-slate-400">
                    {row.tanggalPelaksanaan}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-slate-400 capitalize">
                      {row.users?.full_name}
                    </span>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(row);
                      }}
                      className="text-xs p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* =========================
   SKELETON
========================= */
function EventListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border overflow-hidden">
          <div className="h-44 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}