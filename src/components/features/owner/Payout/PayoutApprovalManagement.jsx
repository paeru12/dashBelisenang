"use client";

import AdminPayoutList from "./components/Approval/AdminPayoutList";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payout Management</h1>
      <AdminPayoutList />
    </div>
  );
}
