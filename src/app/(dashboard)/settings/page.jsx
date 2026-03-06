"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import EventAdminSettings from "@/components/features/eventadmin/Settings";
import SuperAdminSettings from "@/components/features/superadmin/Settings";

export default function SettingsPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <SuperAdminSettings />,
        PROMOTOR_OWNER: <EventAdminSettings />,
      }}
    />
  );
}
