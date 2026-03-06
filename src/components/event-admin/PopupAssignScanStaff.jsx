"use client";

import { useState, useEffect } from "react";
import BaseModal from "@/components/common/BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignScanStaff } from "@/lib/scanStaffApi";
import { getScanStaffUsers } from "@/lib/promotorsApi";
import { successAlert, errorAlert } from "@/lib/alert";

export default function PopupAssignScanStaff({
  open,
  onClose,
  eventId,
  onSuccess
}) {

  const [gate, setGate] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadUsers() {
      try {
        const res = await getScanStaffUsers();
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadUsers();
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!userId) return errorAlert("Error", "Pilih staff");
    if (!gate) return errorAlert("Error", "Nama gate wajib diisi");

    setLoading(true);

    try {

      await assignScanStaff(eventId, {
        user_id: userId,
        gate
      });

      await successAlert("Success", "Staff berhasil ditugaskan");

      setUserId("");
      setGate("");

      onSuccess?.();
      onClose();

    } catch (err) {

      errorAlert("Error", err.response?.data?.message || err.message);

    }

    setLoading(false);
  }

  return (

    <BaseModal
      open={open}
      onClose={onClose}
      title="Assign Scan Staff"
      maxWidth="max-w-lg"
    >

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STAFF SELECT */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Staff Scanner
          </label>

          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Pilih staff</option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* GATE */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Gate Name
          </label>

          <Input
            placeholder="Gate A / VIP Entrance"
            value={gate}
            onChange={(e) => setGate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={loading}>
            Assign Staff
          </Button>
        </div>

      </form>

    </BaseModal>

  );
}