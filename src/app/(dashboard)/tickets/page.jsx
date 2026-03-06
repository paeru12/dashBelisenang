"use client";

import RequireRole from "@/components/common/RequireRole";
import TicketManager from "@/components/features/eventadmin/TicketManager";

export default function TicketsPage() {
  return (
    <RequireRole allowed={["PROMOTOR_EVENT_ADMIN"]}>
      <TicketManager />
    </RequireRole>
  );
}
