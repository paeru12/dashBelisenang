"use client";

import RequireRole from "@/components/common/RequireRole";
import AdminManagement from "@/components/features/superadmin/AdminManagement";

export default function EventAdminsPage() {
  return (
    <RequireRole allowed={["SUPERADMIN"]}>
      <AdminManagement />
    </RequireRole>
  );
}
