"use client";

import RoleRenderer from "@/components/common/RoleRenderer";

import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";
// import SystemAdminDashboard from "@/components/dashboard/SystemAdminDashboard";
// import ContentWriterDashboard from "@/components/dashboard/ContentWriterDashboard";

import EventAdminDashboard from "@/components/dashboard/EventAdminDashboard";
import ScanStaffDashboard from "@/components/dashboard/ScanStaffDashboard";

export default function DashboardPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <SuperAdminDashboard />,
        // SYSTEM_ADMIN: <SystemAdminDashboard />,
        // CONTENT_WRITER: <ContentWriterDashboard />,
        PROMOTOR_OWNER: <SuperAdminDashboard />,
        PROMOTOR_EVENT_ADMIN: <EventAdminDashboard />,
        SCAN_STAFF: <ScanStaffDashboard />,
      }}
    />
  );
}
