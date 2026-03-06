"use client";

import { useState } from "react";
import BaseModal from "@/components/common/BaseModal";
import EventStepOne from "@/components/event-admin/EventStepOne";
import EventStepTwo from "@/components/event-admin/EventStepTwo";
import { updateEvents } from "@/lib/eventApi";
import {
  createTicketType,
  updateTicketType,
} from "@/lib/ticketTypesApi";
import { successAlert, errorAlert } from "@/lib/alert";

export default function EventEditPopup({
  open,
  mode,
  event,
  onClose,
  onSuccess,
}) {
  const [deletedTickets, setDeletedTickets] = useState([]);
  const formatDate = (date) =>
    date ? date.split("T")[0] : "";

  const [eventData, setEventData] = useState({
    flyer: null,
    flyerPreview: event?.image,
    layout: null,
    layoutPreview: event?.layout_venue,
    name: event?.name || "",
    category: event?.kategori_id || "",
    location: event?.location || "",
    province: event?.province || "",
    district: event?.district || "",
    mapUrl: event?.map || "",
    startDate: event?.date_start || "",
    endDate: event?.date_end || "",
    startTime: event?.time_start || "",
    endTime: event?.time_end || "",
    description: event?.deskripsi || "",
    terms: event?.sk || "",
    timezone: event?.timezone || "",
    keywords: event?.keywords
      ? event.keywords.split(",").map((k) => k.trim())
      : [],
    social_link: event?.social_link || {
      instagram: "",
      tiktok: "",
      facebook: "",
      youtube: "",
      website: "",
    },
  });

  const [tickets, setTickets] = useState(
    event?.ticket_types?.map((t) => ({
      id: t.id,
      isNew: false,
      name: t.name,
      description: t.deskripsi,
      price: t.price,
      qty: t.total_stock,
      maxOrder: t.max_per_order,
      status: t.status || "draft",
      adminFeeIncluded: t.admin_fee_included ?? true,
      taxIncluded: t.tax_included ?? false,
      deliverDate: formatDate(t.deliver_ticket),
      startDate: formatDate(t.date_start),
      endDate: formatDate(t.date_end),
      startTime: t.time_start || "",
      endTime: t.time_end || "",
    })) || []
  );

  async function updateEvent() {
    try {
      const fd = new FormData();

      Object.entries({
        name: eventData.name,
        kategori_id: eventData.category,
        location: eventData.location,
        province: eventData.province,
        district: eventData.district,
        map: eventData.mapUrl || "",
        timezone: eventData.timezone,
        date_start: eventData.startDate,
        date_end: eventData.endDate,
        time_start: eventData.startTime,
        time_end: eventData.endTime,
        deskripsi: eventData.description,
        sk: eventData.terms,
        keywords: eventData.keywords.join(","),
      }).forEach(([k, v]) => fd.append(k, v));

      fd.append("social_link", JSON.stringify(eventData.social_link));
      if (eventData.flyer instanceof File)
        fd.append("image", eventData.flyer);

      if (eventData.layout instanceof File)
        fd.append("layout_venue", eventData.layout);

      await updateEvents(event.id, fd);

      await successAlert("Berhasil", "Event diperbarui");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.log(err.response)
      errorAlert("Gagal", err.message);
    }
  }

  async function updateTicket() {
    console.log("DELETED TICKETS:", deletedTickets);

    try {

      const newTickets = tickets.filter(t =>
        String(t.id).startsWith("tmp-")
      );

      const existingTickets = tickets.filter(t =>
        !String(t.id).startsWith("tmp-")
      );

      if (newTickets.length > 0) {
        const createPayload = newTickets.map(t => ({
          name: t.name,
          deskripsi: t.description,
          price: Number(t.price),
          total_stock: Number(t.qty),
          max_per_order: Number(t.maxOrder),
          status: t.status,
          admin_fee_included: t.adminFeeIncluded,
          tax_included: t.taxIncluded,
          deliver_ticket: t.deliverDate,
          date_start: t.startDate,
          date_end: t.endDate,
          time_start: t.startTime,
          time_end: t.endTime,
        }));

        await createTicketType(event.id, createPayload);
      }

      for (const t of existingTickets) {
        const updatePayload = {
          name: t.name,
          deskripsi: t.description,
          price: Number(t.price),
          total_stock: Number(t.qty),
          max_per_order: Number(t.maxOrder),
          status: t.status,
          admin_fee_included: t.adminFeeIncluded,
          tax_included: t.taxIncluded,
          deliver_ticket: t.deliverDate,
          date_start: t.startDate,
          date_end: t.endDate,
          time_start: t.startTime,
          time_end: t.endTime,
        };

        await updateTicketType(event.id, t.id, updatePayload);
      }

      await successAlert("Berhasil", "Ticket diperbarui");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err.response);
      errorAlert("Gagal", err.response?.data?.message || err.message);
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={mode === "event" ? "Edit Event" : "Edit Ticket"}
    >
      {mode === "event" && (
        <EventStepOne
          data={eventData}
          onChange={setEventData}
          onNext={updateEvent}
          isEdit
        />
      )}

      {mode === "ticket" && (
        <EventStepTwo
          eventId={event.id}
          tickets={tickets}
          setTickets={setTickets}
          setDeletedTickets={setDeletedTickets}
          eventStartDate={event.date_start}
          eventEndDate={event.date_end}
          onFinish={updateTicket}
          onSuccess={onSuccess}
          isEdit
        />
      )}
    </BaseModal>

  );
}
