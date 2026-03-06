"use client";

import BaseModal from "@/components/common/BaseModal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { requestPayout } from "@/lib/payoutApi";
import { successAlert, errorAlert } from "@/lib/alert";

export default function CreatePayoutModal({ open, onClose }) {
  const [amount, setAmount] = useState("");

    const handleSubmit = async () => {
      try {
        if (!amount || Number(amount) <= 0)
          return errorAlert("Gagal", "Jumlah payout tidak valid");

        await requestPayout(Number(amount));

        await successAlert("Berhasil", "Permintaan payout berhasil dibuat dan menunggu persetujuan admin");

        setAmount("");
        onClose();

      } catch (err) {
        errorAlert("Gagal", err.response?.data?.message || "Terjadi kesalahan");
      }
    };

    return (
      <BaseModal open={open} onClose={onClose} title="Request Payout">
        <div className="space-y-4 p-1">
          <input
            className="border rounded-lg w-full px-3 py-2"
            placeholder="Jumlah pencairan"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />

          <Button className="w-full" onClick={handleSubmit}>
            Ajukan Payout
          </Button>
        </div>
      </BaseModal>
    );
  }
