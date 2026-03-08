"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import RoleRenderer from "@/components/common/RoleRenderer";
import EventStepOne from "@/components/event-admin/EventCreate";

export default function EventsPage() {
  const router = useRouter();
  return (
    <RoleRenderer
      map={{
        PROMOTOR_OWNER: <EventStepOne onCancel={() => router.back()} />,
        PROMOTOR_EVENT_ADMIN: <EventStepOne />,
      }}
    />
  );
}
