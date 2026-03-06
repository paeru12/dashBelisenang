"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import EventList from "@/components/event-admin/EventList";

export default function EventsPage() {
  return (
    <RoleRenderer
      map={{
        PROMOTOR_OWNER: <EventList />,
        PROMOTOR_EVENT_ADMIN: <EventList />,
      }}
    />
  );
}
