"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import OrderManager from "@/components/features/eventadmin/OrderManager";

export default function OrdersPage() {
  return (
    <RoleRenderer
      map={{
        PROMOTOR_OWNER: <OrderManager />,
        PROMOTOR_EVENT_ADMIN: <OrderManager />,
      }}
    />
  );
}
