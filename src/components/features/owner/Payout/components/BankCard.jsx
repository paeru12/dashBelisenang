"use client";

import SectionCard from "@/components/common/SectionCard";
import useSWR from "swr";
import axios from "@/lib/axios";

export default function BankCard() {
  const { data } = useSWR("/payout/bank/info", () =>
    axios.get("/vi4/payout/bank/info").then((r) => r.data.data)
  );

  if (!data) return null;

  return (
    <SectionCard title="Informasi Bank" description="Akun bank terverifikasi promotor">
      <div className="space-y-2">
        <p className="font-medium uppercase">{data.bank_name}</p>

        <p className="text-sm text-slate-600">
          No. Rekening: {data.account_number}
        </p>

        <p className="text-sm text-slate-600 capitalize">
          Atas Nama: {data.holder_name}
        </p>
      </div>
    </SectionCard>
  );
}
