"use client";
import { useState, useEffect } from "react";
import EventStepOne from "./EventStepOne";
import EventStepTwo from "./EventStepTwo";
import { createEvents } from "@/lib/eventApi";
import { createTicketBundle } from "@/lib/ticketTypesApi";

import { successAlert, errorAlert } from "@/lib/alert";
function scrollToTop() {
  let el = document.getElementById("step-wrapper");

  // cari parent yang punya scroll
  while (el && el.scrollHeight <= el.clientHeight) {
    el = el.parentElement;
  }

  if (el) {
    el.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
export default function EventCreate({ onCancel }) {
  const [step, setStep] = useState(1);
  const [bundles, setBundles] = useState([]);
  useEffect(() => {
    scrollToTop();
  }, [step]);
  /* ================= STATE UTAMA ================= */
  const [eventData, setEventData] = useState({
    event: {
      name: "",
      category: "",
      location: "",
      province: "",
      district: "",
      mapUrl: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      timezone: "",
      description: "",
      terms: "",
      keywords: [],
      flyer: null,
      flyerPreview: "",
      layout: null,
      layoutPreview: "",
      social_link: {
        instagram: "",
        tiktok: "",
        facebook: "",
        youtube: "",
        website: "",
      },
    },
  });


  /* ================= TICKETS ================= */
  const [tickets, setTickets] = useState([
    {
      id: Date.now().toString(),
      group: "",
      name: "",
      description: "",

      price: "",
      qty: "",

      maxOrder: "",

      status: "scheduled",

      adminFeeIncluded: true,
      taxIncluded: true,

      deliverDate: "",

      saleStart: "",
      saleEnd: "",

      validStart: "",
      validEnd: "",
    }
  ]);


  const [activeTicketId, setActiveTicketId] = useState(tickets[0].id);

  async function handleFinish() {
    try {

      const e = eventData.event;

      const formData = new FormData();

      formData.append("kategori_id", e.category);
      formData.append("province", e.province);
      formData.append("district", e.district);
      formData.append("name", e.name);
      formData.append("deskripsi", e.description);
      formData.append("sk", e.terms);

      formData.append("date_start", e.startDate);
      formData.append("date_end", e.endDate);
      formData.append("time_start", e.startTime);
      formData.append("time_end", e.endTime);
      formData.append("timezone", e.timezone);

      formData.append("location", e.location);
      formData.append("map", e.mapUrl || "");
      formData.append("keywords", e.keywords.join(","));
      formData.append("social_link", JSON.stringify(e.social_link));

      if (e.flyer instanceof File) {
        formData.append("image", e.flyer);
      }

      if (e.layout instanceof File) {
        formData.append("layout_venue", e.layout);
      }

      const ticketPayload = tickets.map((t) => ({
        ticket_group_id: t.group,
        name: t.name,
        deskripsi: t.description,
        price: Number(t.price),
        total_stock: Number(t.qty),
        max_per_order: Number(t.maxOrder),
        admin_fee_included: t.adminFeeIncluded,
        tax_included: t.taxIncluded,
        deliver_ticket: t.deliverDate,
        sale_start: t.saleStart,
        sale_end: t.saleEnd,
        valid_start: t.validStart || null,
        valid_end: t.validEnd || null,
        ticket_usage_type: "single_entry",
        status: t.status,
      }));

      formData.append("ticket_types", JSON.stringify(ticketPayload));

      const res = await createEvents(formData);

      const eventId = res.data.data.id;

      await createTicketBundle(eventId, bundles);

      await successAlert("Berhasil", "Event berhasil dibuat");

      onCancel();

    } catch (err) {

      console.log(err);

      errorAlert(
        "Gagal",
        err.response?.data?.message || err.message
      );

    }
  }

  return (
    <div className="md:p-6 rounded-lg transition-all duration-300" id="step-wrapper">
      {step === 1 && (
        <EventStepOne
          data={eventData.event}
          onChange={(event) =>
            setEventData((prev) => ({
              ...prev,
              event,
            }))
          }
          onNext={() => setStep(2)}
          onCancel={onCancel}
        />
      )}

      {step === 2 && (
        <EventStepTwo
          tickets={tickets}
          setTickets={setTickets}
          bundles={bundles}
          setBundles={setBundles}
          activeTicketId={activeTicketId}
          setActiveTicketId={setActiveTicketId}
          onBackStep={() => setStep(1)}
          onFinish={handleFinish}
          eventStartDate={eventData.event.startDate}
          eventEndDate={eventData.event.endDate}
        />
      )}
    </div>
  );
}

