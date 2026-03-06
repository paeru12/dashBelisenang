"use client";

import BalanceCards from "./components/BalanceCards";
import HistoryTable from "./components/HistoryTable";
import CreatePayoutModal from "./components/CreatePayoutModal";
import BankCard from "./components/BankCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PayoutManagement() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Saldo & Payout</h1>

      <BalanceCards />

      <BankCard />

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          Request Payout
        </Button>
      </div>

      <HistoryTable />

      <CreatePayoutModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
