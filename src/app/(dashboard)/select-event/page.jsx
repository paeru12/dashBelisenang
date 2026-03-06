"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import EventSelector from "@/components/features/scanstaff/EventSelector";

export default function SelectEventPage() {
  return (
    <RoleRenderer
      map={{
        SCAN_STAFF: <EventSelector />
      }}
    />
  );
}
