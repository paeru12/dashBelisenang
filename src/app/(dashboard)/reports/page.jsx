"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import ReportStatistics from "@/components/features/eventadmin/ReportStatistics";

export default function ReportsPage() {
  return (
    <RoleRenderer
      map={{
        PROMOTOR_OWNER: <ReportStatistics />
      }}
    />
  );
}
