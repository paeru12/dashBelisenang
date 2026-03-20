"use client";

import { useState } from "react";
import BaseModal from "@/components/common/BaseModal";
import EventStepOne from "@/components/event-admin/EventStepOne";
import EventStepTwo from "@/components/event-admin/EventStepTwo";
import { updateEvents } from "@/lib/eventApi";
import {
  createTicketType,
  updateTicketType,
  createTicketBundle,
  updateTicketBundle
} from "@/lib/ticketTypesApi";
import { successAlert, errorAlert } from "@/lib/alert";
import { toDatetimeLocal } from "@/utils/date";
export default function EventEditPopup({
  open,
  mode,
  event,
  onClose,
  onSuccess,
}) {
  const [deletedTickets, setDeletedTickets] = useState([]);
  const [bundles, setBundles] = useState([]);
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
    startDate: event?.sale_start || "",
    endDate: event?.sale_end || "",
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

      group: t.ticket_group_id,

      name: t.name,
      description: t.deskripsi,

      price: t.price,
      qty: t.total_stock,

      maxOrder: t.max_per_order,

      ticket_usage_type: t.ticket_usage_type || "single_entry",

      adminFeeIncluded: t.admin_fee_included ?? true,
      taxIncluded: t.tax_included ?? false,

      deliverDate: toDatetimeLocal(t.deliver_ticket),

      saleStart: toDatetimeLocal(t.sale_start),
      saleEnd: toDatetimeLocal(t.sale_end),

      validStart: toDatetimeLocal(t.valid_start),
      validEnd: toDatetimeLocal(t.valid_end),

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

  async function updateTicket(payload) {

    try {

      const { ticket_types, bundles } = payload

      const newTickets = ticket_types.filter(t =>
        String(t.id).startsWith("tmp-")
      )

      const existingTickets = ticket_types.filter(t =>
        !String(t.id).startsWith("tmp-")
      )

      /* =============================
         CREATE NEW TICKET TYPES
      ============================= */

      if (newTickets.length > 0) {

        const createPayload = newTickets.map(t => ({
          ticket_group_id: t.group,
          name: t.name,
          deskripsi: t.description,
          price: Number(t.price),
          total_stock: Number(t.qty),
          max_per_order: Number(t.maxOrder),
          ticket_usage_type: t.ticket_usage_type,
          admin_fee_included: t.adminFeeIncluded,
          tax_included: t.taxIncluded,
          deliver_ticket: t.deliverDate,
          sale_start: t.saleStart,
          sale_end: t.saleEnd,
          valid_start: t.validStart || null,
          valid_end: t.validEnd || null,
          status: t.status
        }))

        await createTicketType(event.id, createPayload)

      }

      /* =============================
         UPDATE EXISTING TICKETS
      ============================= */

      for (const t of existingTickets) {

        const updatePayload = {
          ticket_group_id: t.group,
          name: t.name,
          deskripsi: t.description,
          price: Number(t.price),
          total_stock: Number(t.qty),
          max_per_order: Number(t.maxOrder),
          ticket_usage_type: t.ticket_usage_type,
          admin_fee_included: t.adminFeeIncluded,
          tax_included: t.taxIncluded,
          deliver_ticket: t.deliverDate,
          sale_start: t.saleStart,
          sale_end: t.saleEnd,
          valid_start: t.validStart || null,
          valid_end: t.validEnd || null,
          status: t.status
        }

        await updateTicketType(event.id, t.id, updatePayload)

      }

      /* =============================
         HANDLE BUNDLES
      ============================= */

      const cleanBundle = (bundle) => ({
        name: bundle.name,
        description: bundle.description || null,
        price: Number(bundle.price),
        max_per_order: Number(bundle.maxOrder) || 10,
        status: bundle.status || "draft",
        items: (bundle.items || []).map(i => ({
          ticket_type_id: i.ticket_type_id,
          quantity: Number(i.quantity)
        }))
      });


      // pisahkan
      const newBundles = bundles.filter(b =>
        String(b.id).startsWith("bundle-")
      );

      const existingBundles = bundles.filter(b =>
        !String(b.id).startsWith("bundle-")
      );

      /* =============================
         CREATE NEW (BULK)
      ============================= */

      if (newBundles.length > 0) {

        const payloadBulk = newBundles.map(cleanBundle);

        await createTicketBundle(event.id, payloadBulk);
      }

      /* =============================
         UPDATE EXISTING
      ============================= */

      for (const bundle of existingBundles) {

        const payload = cleanBundle(bundle);

        await updateTicketBundle(event.id, bundle.id, payload);

      }

      await successAlert("Berhasil", "Ticket diperbarui")

      onSuccess?.()

      onClose()

    } catch (err) {

      console.error(err)

      errorAlert(
        "Gagal",
        err.response?.data?.message || err.message
      )

    }

  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-6xl"
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
          bundles={bundles}
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
