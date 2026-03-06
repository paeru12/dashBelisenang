"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getEvent } from "@/lib/eventApi";
import EventDetailPage from "@/components/event-admin/EventDetailPage";
import RoleRenderer from "@/components/common/RoleRenderer";
export default function EventDetailRoute() {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await getEvent(id);
      setEventData({
        event: res.data,
        media: res.media,
      });
    }
    if (id) fetchData();
  }, [id]);


  if (!eventData) return <EventDetailSkeleton />;

  return (
    <RoleRenderer
      map={{
        PROMOTOR_OWNER: <EventDetailPage
          event={eventData.event}
          media={eventData.media}
          onRefresh={() => {
            getEvent(id).then((res) => {
              setEventData({
                event: res.data,
                media: res.media,
              });
            });
          }}
        />,
        PROMOTOR_EVENT_ADMIN: <EventDetailPage
          event={eventData.event}
          media={eventData.media}
          onRefresh={() => {
            getEvent(id).then((res) => {
              setEventData({
                event: res.data,
                media: res.media,
              });
            });
          }}
        />,
      }}
    />

  );
}

function EventDetailSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 animate-pulse">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">

        {/* MAIN */}
        <div className="xl:col-span-3 space-y-10">

          {/* HERO */}
          <div className="h-[320px] rounded-2xl bg-slate-200" />

          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
            ))}
          </div>

          {/* CHARTS */}
          <div className="h-80 bg-slate-200 rounded-xl" />
          <div className="h-80 bg-slate-200 rounded-xl" />

          {/* DETAIL CARD */}
          <div className="bg-white rounded-3xl shadow-xl border p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-slate-200 rounded" />
              ))}
            </div>

            <div className="h-20 bg-slate-200 rounded-xl" />

            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}