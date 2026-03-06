"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import StaffManager1 from "@/components/features/superadmin/StaffManager";
import StaffManager from "@/components/features/eventadmin/StaffManager";

export default function ScanStaffPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <StaffManager1 />,
        PROMOTOR_OWNER: <StaffManager />,
      }}
    />
  );
}
