"use client";

import { useState } from "react";
import { updateTicketType } from "@/lib/ticketTypesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TicketSingleUpdate({ ticket, onSuccess, onCancel }) {
  const [data, setData] = useState(ticket);

  async function submit() {
    await updateTicketType(ticket.id, {
      name: data.name,
      deskripsi: data.deskripsi,
      price: Number(data.price),
      total_stock: Number(data.total_stock),
      max_per_order: Number(data.max_per_order),
    });

    onSuccess();
  }

  return (
    <div className="bg-white p-6 rounded-lg max-w-xl">
      <h2 className="text-lg font-semibold mb-4">
        Edit Ticket
      </h2>

      <Input
        value={data.name}
        onChange={e => setData({ ...data, name: e.target.value })}
      />

      <div className="flex gap-2 mt-4">
        <Button onClick={submit}>Update</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
