"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import PayoutApproval from "@/components/features/owner/Payout/PayoutApprovalManagement";
import PayoutManagement from "@/components/features/owner/Payout/PayoutManagement";
export default function PayoutsPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <PayoutApproval />,
        PROMOTOR_OWNER: <PayoutManagement />
      }}
    />
  );
}
