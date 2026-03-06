"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import ScanHistory from "@/components/features/scanstaff/ScanHistory";

export default function SelectEventPage() {
  return (
    <RoleRenderer 
    map={{
      SCAN_STAFF: <ScanHistory />
    }}
    />
  );
}
