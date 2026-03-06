"use client";

import {
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Copy,
  ChevronDown
} from "lucide-react";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { confirmAlert } from "@/lib/alert";
import { formatRupiah, parseRupiah } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { deleteTicketType } from "@/lib/ticketTypesApi";
import { successAlert, errorAlert } from "@/lib/alert";

import { getTaxRate, getAdminFee } from "@/lib/financeApi";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/common/RichTextEditor.client"),
  { ssr: false }
);
const STATUS_OPTIONS = [
  { value: "", label: "Pilih Status" },
  { value: "available", label: "Available" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
];

export default function EventStepTwo({
  tickets = [],
  setTickets,
  eventId,
  onBackStep,
  onFinish,
  eventStartDate,
  eventEndDate,
  onSuccess,
  isEdit = false
}) {


  const { data: finance, isLoading: financeLoading } = useSWR("/fee", getAdminFee);
  const { data: taxRate, isLoading: taxLoading } = useSWR("/tax", getTaxRate);

  const adminType = financeLoading
    ? null
    : finance?.data?.admin_fee_type || "percent";

  const adminValue = financeLoading
    ? null
    : Number(finance?.data?.admin_fee_value);

  const taxPercent = taxLoading
    ? null
    : Number(taxRate?.data?.tax_rate);

  /* ------------------------------------------------------------------
      TICKET STATES
  ------------------------------------------------------------------ */
  const [collapsed, setCollapsed] = useState(false);
  const [localActiveId, setLocalActiveId] = useState(null);
  const [calcMode, setCalcMode] = useState("satuan");

  const activeTicketId =
    tickets.find((t) => t.id === localActiveId)?.id || tickets[0]?.id;

  const activeTicket = tickets.find((t) => t.id === activeTicketId);
  if (!activeTicket) return null;

  const isLocked = (activeTicket.sold || 0) > 0;

  function update(key, value) {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== activeTicketId) return t;

        let updated = { ...t, [key]: value };

        if (updated.endDate > eventEndDate)
          updated.endDate = eventEndDate;

        if (updated.endDate < updated.startDate)
          updated.endDate = updated.startDate;

        return updated;
      })
    );
  }

  const price = Number(activeTicket.price) || 0;
  const qty = Number(activeTicket.qty) || 0;

  const adminToBuyer = !!activeTicket.adminFeeIncluded;
  const taxToBuyer = !!activeTicket.taxIncluded;

  /* ------------------------------------------------------------------
      HITUNG ADMIN FEE
  ------------------------------------------------------------------ */
  const adminSingle =
    adminType === "flat"
      ? adminValue
      : (price * adminValue) / 100;

  /* ------------------------------------------------------------------
      HITUNG TAX
  ------------------------------------------------------------------ */
  const taxSingle = (price * taxPercent) / 100;

  /* ------------------------------------------------------------------
      SINGLE CALCULATION
  ------------------------------------------------------------------ */
  const buyerSingle =
    price +
    (adminToBuyer ? adminSingle : 0) +
    (taxToBuyer ? taxSingle : 0);

  const organizerSingle =
    price -
    (!adminToBuyer ? adminSingle : 0) -
    (!taxToBuyer ? taxSingle : 0);

  /* ------------------------------------------------------------------
      GLOBAL CALCULATION
  ------------------------------------------------------------------ */
  const grossGlobal = price * qty;

  const adminGlobal =
    adminType === "flat"
      ? adminValue * qty
      : (price * qty * adminValue) / 100;

  const taxGlobal = (price * qty * taxPercent) / 100;

  const buyerGlobal =
    grossGlobal +
    (adminToBuyer ? adminGlobal : 0) +
    (taxToBuyer ? taxGlobal : 0);

  const organizerGlobal =
    grossGlobal -
    (!adminToBuyer ? adminGlobal : 0) -
    (!taxToBuyer ? taxGlobal : 0);

  /* ------------------------------------------------------------------
      TICKET ACTIONS
  ------------------------------------------------------------------ */

  const today = new Date().toISOString().split("T")[0];

  function addTicket() {
    setTickets([
      ...tickets,
      {
        id: `tmp-${Date.now()}`,
        isNew: true,
        name: "",
        description: "",
        price: "",
        qty: "",
        sold: 0,
        maxOrder: "",
        status: "draft",
        adminFeeIncluded: true,
        taxIncluded: true,
        deliverDate: eventStartDate,
        startDate: eventStartDate,
        endDate: eventStartDate,
        startTime: "",
        endTime: "",
      }
    ]);
  }

  async function deleteTicket(id) {
    if (tickets.length <= 1) return;

    const res = await confirmAlert({
      title: "Hapus Ticket?",
      text: "Tidak bisa dikembalikan",
      confirmText: "Hapus",
    });

    if (!res.isConfirmed) return;

    const isTemp = String(id).startsWith("tmp-");

    if (!isTemp) {
      await deleteTicketType(eventId, id);
      await successAlert("Berhasil", "Ticket dihapus");
      onSuccess?.();
    }

    setTickets((prev) => prev.filter((t) => t.id !== id));
  }

  function duplicateTicket() {
    const copy = {
      ...activeTicket,
      id: `tmp-${Date.now()}`,
      isNew: true,
      name: activeTicket.name + " (Copy)",
    };

    setTickets([...tickets, copy]);
    setLocalActiveId(copy.id);
  }

  function finish() {
    onFinish?.();
  }


  /* ------------------------------------------------------------------
      RENDER PAGE
  ------------------------------------------------------------------ */

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10 pb-8">

      {/* LEFT LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR TICKET LIST */}
        <div className="lg:col-span-4 space-y-4 ">

          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setLocalActiveId(t.id)}
              className={`relative p-4 rounded-xl border shadow-md cursor-pointer transition
                ${t.id === activeTicketId ? "bg-indigo-50 border-indigo-600" : "bg-white"}
                hover:shadow-sm`}
            >

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTicket();
                  }}
                  className="text-slate-500 hover:text-indigo-600"
                >
                  <Copy size={16} />
                </button>

                {tickets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTicket(t.id);
                    }}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="font-semibold uppercase truncate">
                {t.name || "-"}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {formatRupiah(t.price || 0)}
              </div>

              <div className="text-xs text-slate-400">
                Stok: {t.qty || 0}
              </div>
            </div>
          ))}

          <Button className="w-full" onClick={addTicket}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tiket
          </Button>

        </div>

        {/* MAIN PANEL */}
        <div className="lg:col-span-8">

          {/* COLLAPSIBLE CALC PANEL */}
          <div className="shadow-md border rounded-xl p-4 mb-4">

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Detail Ticket</h3>

              <motion.button
                onClick={() => setCollapsed(!collapsed)}
                animate={{ rotate: collapsed ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <ChevronDown className="cursor-pointer" />
              </motion.button>
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="detail-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 20,
                    mass: 0.6,
                  }}
                  className="overflow-hidden space-y-6 mt-4"
                >

                  {/* Tabs calc mode */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    <TabButton active={calcMode === "satuan"} onClick={() => setCalcMode("satuan")}>
                      Satuan
                    </TabButton>
                    <TabButton active={calcMode === "global"} onClick={() => setCalcMode("global")}>
                      Per Tipe
                    </TabButton>
                  </div>

                  {/* ==================== CALC PANEL ==================== */}
                  <div className="bg-gradient-to-br from-indigo-50 to-white border rounded-2xl p-6 shadow-sm space-y-4">

                    {calcMode === "satuan" && (
                      <>
                        <Row label="Harga Ticket" value={formatRupiah(price)} />

                        {/* ADMIN FEE ROW */}
                        {financeLoading ? (
                          <Row label="Admin Fee" value={<Skeleton width="70px" />} />
                        ) : (
                          <Row
                            label={`Admin Fee (${adminType})`}
                            value={formatRupiah(adminSingle)}
                            color={adminToBuyer ? "green" : "red"}
                            sign={adminToBuyer ? "+" : "-"}
                          />
                        )}

                        {/* TAX ROW */}
                        {taxLoading ? (
                          <Row label="Tax" value={<Skeleton width="50px" />} />
                        ) : (
                          <Row
                            label={`Tax (${taxPercent}%)`}
                            value={formatRupiah(taxSingle)}
                            color={taxToBuyer ? "green" : "red"}
                            sign={taxToBuyer ? "+" : "-"}
                          />
                        )}

                        <TotalRow label="Buyer Pay" value={formatRupiah(buyerSingle)} />
                        <TotalRow label="Organizer Net" value={formatRupiah(organizerSingle)} bold />
                      </>
                    )}

                    {calcMode === "global" && (
                      <>
                        <Row label="Total Gross" value={formatRupiah(grossGlobal)} />
                        {financeLoading ? (
                          <Row label="Admin Fee" value={<Skeleton width="70px" />} />
                        ) : (
                          <Row
                            label={`Total Admin Fee (${adminType})`}
                            value={formatRupiah(adminGlobal)}
                            color={adminToBuyer ? "green" : "red"}
                            sign={adminToBuyer ? "+" : "-"}
                          />
                        )}
                        {taxLoading ? (
                          <Row label="Tax" value={<Skeleton width="50px" />} />
                        ) : (
                          <Row
                            label={`Total Tax (${taxPercent}%)`}
                            value={formatRupiah(taxGlobal)}
                            color={taxToBuyer ? "green" : "red"}
                            sign={taxToBuyer ? "+" : "-"}
                          />
                        )}

                        <TotalRow label="Total Buyer Pay" value={formatRupiah(buyerGlobal)} />
                        <TotalRow label="Total Organizer Net" value={formatRupiah(organizerGlobal)} bold />
                      </>
                    )}
                  </div>

                  {/* SWITCH - ADMIN FEE */}
                  <SwitchRow
                    label="Admin Fee"
                    desc={activeTicket.adminFeeIncluded ? "Dibayar oleh Buyer" : "Ditanggung Organizer"}
                    active={activeTicket.adminFeeIncluded}
                    onClick={() => update("adminFeeIncluded", !activeTicket.adminFeeIncluded)}
                  />

                  {/* SWITCH - TAX */}
                  <SwitchRow
                    label={`Tax (${taxPercent}%)`}
                    desc={activeTicket.taxIncluded ? "Dibayar oleh Buyer" : "Ditanggung Organizer"}
                    active={activeTicket.taxIncluded}
                    onClick={() => update("taxIncluded", !activeTicket.taxIncluded)}
                  />

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* FORM AREA */}
          <div className="bg-white rounded-2xl shadow-md border p-6 space-y-6">

            <div>
              <label className="text-sm font-medium">Nama Tiket *</label>
              <Input
                value={activeTicket.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Deskripsi *</label>
              <RichTextEditor
                value={activeTicket.description}
                onChange={(v) => update("description", v)}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Harga *</label>
                <Input
                  disabled={isLocked}
                  value={formatRupiah(activeTicket.price)}
                  onChange={(e) => update("price", parseRupiah(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Total Stok *</label>
                <Input
                  type="number"
                  disabled={isLocked}
                  value={activeTicket.qty}
                  onChange={(e) => update("qty", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Max / Order *</label>
                <Input
                  type="number"
                  value={activeTicket.maxOrder}
                  onChange={(e) => update("maxOrder", e.target.value)}
                />
              </div>
            </div>

            {/* DATES */}
            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <label className="text-sm font-medium">Tanggal Mulai Penjualan *</label>
                <Input
                  type="date"
                  min={today}
                  max={eventEndDate}
                  value={activeTicket.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Jam Mulai Penjualan *</label>
                <Input
                  type="time"
                  value={activeTicket.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tanggal Selesai Penjualan *</label>
                <Input
                  type="date"
                  min={today}
                  max={eventEndDate}
                  value={activeTicket.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Jam Selesai Penjualan *</label>
                <Input
                  type="time"
                  value={activeTicket.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tanggal Kirim Tiket *</label>
                <Input
                  type="date"
                  min={today}
                  max={eventEndDate}
                  value={activeTicket.deliverDate}
                  onChange={(e) => update("deliverDate", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status Tiket *</label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={activeTicket.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className={`pt-2 ${isEdit ? "grid md:justify-end" : "flex md:justify-between"}`}>
        {!isEdit && (
          <Button variant="outline" onClick={onBackStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        )}

        <Button onClick={finish}>
          <Check className="w-4 h-4 mr-2" />
          {isEdit ? "Update" : "Selesai"}
        </Button>
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------
    UI COMPONENTS
------------------------------------------------------------------ */

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg transition ${active
        ? "bg-white shadow text-indigo-600"
        : "text-slate-500 hover:text-slate-700"
        }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, color, sign }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className={`font-medium ${color ? `text-${color}-600` : ""}`}>
        {sign || ""}{value}
      </span>
    </div>
  );
}

function TotalRow({ label, value, bold }) {
  return (
    <div className={`border-t pt-3 flex justify-between ${bold ? "font-bold text-indigo-700" : "font-semibold"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SwitchRow({ label, desc, active, onClick }) {
  return (
    <div className="flex items-center justify-between border rounded-xl p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out ${active ? "bg-indigo-600" : "bg-slate-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${active ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

function Skeleton({ width = "100px" }) {
  return (
    <div
      className="bg-slate-300 animate-pulse rounded"
      style={{ width, height: "14px" }}
    />
  );
}