"use client";

import { useState } from "react";
import EventStepTwo from "@/components/event-admin/EventStepTwo";
import {
  createTicketType,
  updateTicketType,
  deleteTicketType
} from "@/lib/ticketTypesApi";
import { successAlert, errorAlert } from "@/lib/alert";

export default function TicketUpdateDialog({ event, onClose, onSuccess }) {
  const [tickets, setTickets] = useState(
    event.ticket_types.map(t => ({
      id: t.id,
      isNew: false,
      name: t.name,
      description: t.deskripsi,
      price: t.price,
      qty: t.total_stock,
      maxOrder: t.max_per_order,
      status: t.status,
      deliverDate: t.deliver_ticket,
      startDate: t.date_start,
      endDate: t.date_end,
      startTime: t.time_start,
      endTime: t.time_end,
    }))
  );

  async function submit() {
    try {
      const newTickets = tickets.filter(t => t.isNew);

      if (newTickets.length) {
        await createTicketType(
          newTickets.map(t => ({
            event_id: event.id,
            name: t.name,
            deskripsi: t.description,
            price: Number(t.price),
            total_stock: Number(t.qty),
            max_per_order: Number(t.maxOrder),
            status: t.status,
            is_active: true,
            deliver_ticket: t.deliverDate,
            date_start: t.startDate,
            date_end: t.endDate,
            time_start: t.startTime,
            time_end: t.endTime,
          }))
        );
      }

      const existingTickets = tickets.filter(
        t => !t.isNew && !t.id.startsWith("tmp-")
      );

      for (const t of existingTickets) {
        await updateTicketType(t.id, {
          name: t.name,
          deskripsi: t.description,
          price: Number(t.price),
          total_stock: Number(t.qty),
          max_per_order: Number(t.maxOrder),
          deliver_ticket: t.deliverDate,
          date_start: t.startDate,
          date_end: t.endDate,
          time_start: t.startTime,
          time_end: t.endTime,
          status: t.status,
          is_active: true,
        });
      }

      await successAlert("Berhasil", "Ticket berhasil diperbarui");
      onSuccess?.();
      onClose?.();
    } catch (e) {
      errorAlert("Gagal", e.response?.data?.message || e.message);
    }
  }

  async function handleDeleteTicket(id) {
    const ticket = tickets.find(t => t.id === id);

    if (ticket?.isNew) {
      setTickets(prev => prev.filter(t => t.id !== id));
      return;
    }

    try {
      await deleteTicketType(id);
      await successAlert("Berhasil", "Ticket berhasil dihapus");
      onSuccess?.();
      onClose?.();
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.log(e)
      errorAlert(
        "Gagal",
        e.response?.data?.message || e.message
      );
    }
  }

  return (
    <EventStepTwo
      tickets={tickets}
      setTickets={setTickets}
      onDeleteTicket={handleDeleteTicket}
      onFinish={submit}
      isEdit
    />

  );
}
