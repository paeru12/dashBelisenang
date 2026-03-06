"use client";

import RequireRole from "@/components/common/RequireRole";
import TicketTypeManager from "@/components/features/eventadmin/TicketTypeManager";

export default function TicketTypesPage() {
  return (
    <RequireRole allowed={["PROMOTOR_EVENT_ADMIN"]}>
      <TicketTypeManager />
    </RequireRole>
  );
}
