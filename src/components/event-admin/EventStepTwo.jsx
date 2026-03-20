"use client";

import {
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Copy,
  ChevronDown
} from "lucide-react";

import { useState, useMemo, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { confirmAlert } from "@/lib/alert";
import { formatRupiah, parseRupiah } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { deleteTicketType, getTicketGroup, getTicketBundles, deleteTicketBundle } from "@/lib/ticketTypesApi";
import { successAlert, errorAlert } from "@/lib/alert";

import { getTaxRate, getAdminFee } from "@/lib/financeApi";
import dynamic from "next/dynamic";
import FormSelect from "@/components/ui/formSelect";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core"
const RichTextEditor = dynamic(
  () => import("@/components/common/RichTextEditor"),
  { ssr: false }
);

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

  const [mode, setMode] = useState("types");

  const [bundles, setBundles] = useState([]);
  const [bundleErrors, setBundleErrors] = useState({});
  const [activeBundleId, setActiveBundleId] = useState(null);

  const { data: bundleData } = useSWR(
    eventId ? `/events/${eventId}/bundles` : null,
    () => getTicketBundles(eventId)
  )

  useEffect(() => {
    const list = bundleData?.data?.data || bundleData?.data || [];

    if (Array.isArray(list)) {
      setBundles(list);
    } else {
      setBundles([]);
    }
  }, [bundleData]);

  const activeBundle = useMemo(() => {
    if (!Array.isArray(bundles)) return null;
    return bundles.find(b => b.id === activeBundleId);
  }, [bundles, activeBundleId]);

  const activeIndex = useMemo(() => {
    return bundles.findIndex(b => b.id === activeBundleId);
  }, [bundles, activeBundleId]);

  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const { data: finance, isLoading: financeLoading } = useSWR("/fee", getAdminFee);
  const { data: taxRate, isLoading: taxLoading } = useSWR("/tax", getTaxRate);
  const { data: TicketGroup, isLoading: TicketGroupLoading } = useSWR("/getTicketGroup", getTicketGroup);
  const groups = financeLoading
    ? null
    : TicketGroup?.data?.data;
  console.log(groups)

  const parseGroup = useMemo(() => {

    if (!groups) return []

    return groups.map(g => ({
      id: g.id,
      name: g.name
    }))

  }, [groups])

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

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) || tickets[0],
    [tickets, activeTicketId]
  );
  if (!activeTicket) return null;

  const isLocked = (activeTicket.sold || 0) > 0;

  function update(key, value) {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== activeTicketId) return t;

        let updated = { ...t, [key]: value };

        /* VALIDASI SALE PERIOD */

        if (key === "saleStart") {
          if (value < `${eventStartDate}T00:00`) {
            updated.saleStart = `${eventStartDate}T00:00`;
          }
        }

        if (key === "saleEnd") {
          if (value > `${eventEndDate}T23:59`) {
            updated.saleEnd = `${eventEndDate}T23:59`;
          }
        }

        /* VALIDASI VALID TICKET */

        if (key === "validStart") {
          if (value < `${eventStartDate}T00:00`) {
            updated.validStart = `${eventStartDate}T00:00`;
          }
        }

        if (key === "validEnd") {
          if (value > `${eventEndDate}T23:59`) {
            updated.validEnd = `${eventEndDate}T23:59`;
          }
        }

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

  const bundleAutoPrice = useMemo(() => {

    if (!activeBundle) return 0

    let total = 0

    activeBundle.items.forEach(item => {

      const ticket = tickets.find(t => t.id === item.ticket_type_id)

      if (ticket) {
        total += (ticket.price || 0) * item.quantity
      }

    })

    return total

  }, [activeBundle, tickets])

  const finalBundlePrice = useMemo(() => {

    const discount = activeBundle?.discount || 0

    return bundleAutoPrice - (bundleAutoPrice * discount / 100)

  }, [bundleAutoPrice, activeBundle])

  /* ------------------------------------------------------------------
      TICKET ACTIONS
  ------------------------------------------------------------------ */

  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    if (!eventStartDate || !eventEndDate) return;

    setTickets((prev) =>
      prev.map((t) => ({
        ...t,
        validStart: t.validStart || `${eventStartDate}T00:00`,
        validEnd: t.validEnd || `${eventEndDate}T23:59`,
      }))
    );
  }, [eventStartDate, eventEndDate]);

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
        status: "scheduled",
        adminFeeIncluded: true,
        taxIncluded: true,
        deliverDate: `${eventStartDate}T00:00`,
        saleStart: `${eventStartDate}T00:00`,
        saleEnd: `${eventEndDate}T23:59`,
        validStart: `${eventStartDate}T00:00`,
        validEnd: `${eventEndDate}T23:59`,
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

  function addBundle() {

    const bundle = {
      id: `bundle-${Date.now()}`,
      name: "",
      price: "",
      maxOrder: 10,
      items: []
    }

    setBundles([...bundles, bundle])
    setActiveBundleId(bundle.id)

  }

  function updateBundle(key, value) {

    setBundles(prev =>
      prev.map(b =>
        b.id === activeBundleId
          ? { ...b, [key]: value }
          : b
      ))

  }

  function addBundleItem() {

    if (!activeBundle) return

    const updated = { ...activeBundle }

    updated.items = [...updated.items, {
      ticket_type_id: "",
      quantity: 1
    }]

    updateBundle("items", updated.items)

  }

  function updateBundleItem(index, key, value) {

    if (!activeBundle) return

    const updated = { ...activeBundle }

    updated.items = [...updated.items]

    updated.items[index][key] = value

    updateBundle("items", updated.items)

  }

  function duplicateBundle(id) {

    const bundle = bundles.find(b => b.id === id)

    const copy = {
      ...bundle,
      id: `bundle-${Date.now()}`,
      name: bundle.name + " Copy"
    }

    setBundles(prev => [...prev, copy])
    setActiveBundleId(copy.id)

  }

  async function deleteBundle(id) {

    const res = await confirmAlert({
      title: "Hapus Bundle?",
      text: "Bundle akan dihapus",
      confirmText: "Hapus"
    });

    if (!res.isConfirmed) return;

    if (!String(id).startsWith("bundle-")) {

      await deleteTicketBundle(eventId, id);

    }

    setBundles(prev => prev.filter(b => b.id !== id));

  }

  function removeBundleItem(index) {

    const updated = { ...activeBundle }

    updated.items.splice(index, 1)

    updateBundle("items", updated.items)

  }

  function validateBundle(bundle) {

    const errors = {};

    if (!bundle.name) errors.name = "Nama wajib diisi";

    if (!bundle.price || Number(bundle.price) <= 0)
      errors.price = "Harga tidak valid";

    if (!bundle.items || bundle.items.length === 0)
      errors.items = "Minimal 1 item";

    bundle.items?.forEach((item, i) => {

      if (!item.ticket_type_id)
        errors[`item_${i}_ticket`] = "Pilih tiket";

      if (!item.quantity || item.quantity <= 0)
        errors[`item_${i}_qty`] = "Qty wajib > 0";

    });

    return errors;
  }

  function finish() {

    let hasError = false;
    let newErrors = {};

    bundles.forEach((b, i) => {

      const err = validateBundle(b);

      if (Object.keys(err).length > 0) {
        hasError = true;
        newErrors[i] = err;
      }

    });

    setBundleErrors(newErrors);

    if (hasError) return;

    onFinish({
      ticket_types: tickets,
      bundles
    });
  }

  /* ------------------------------------------------------------------
      RENDER PAGE
  ------------------------------------------------------------------ */

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10 pb-8">
      {isEdit && (
        <div className="inline-flex bg-slate-100 rounded-xl p-1 mb-6 text-sm sm:text-base">
          <TabButton
            active={mode === "types"}
            onClick={() => setMode("types")}
          >
            Ticket
          </TabButton>

          <TabButton
            active={mode === "bundles"}
            onClick={() => setMode("bundles")}
          >
            Bundle
          </TabButton>
        </div>
      )}
      {/* LEFT LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR TICKET LIST */}
        <div className="lg:col-span-4 space-y-4 ">
          {mode === "types" && (
            <>
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
            </>
          )}
          {mode === "bundles" && (
            <>

              {bundles.map((b) => (

                <div
                  key={b.id}
                  onClick={() => setActiveBundleId(b.id)}
                  className={`relative p-4 rounded-xl border shadow-md cursor-pointer
                    ${b.id === activeBundleId ? "bg-indigo-50 border-indigo-600" : "bg-white"}`}
                >

                  <div className="absolute top-3 right-3 flex gap-2">

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateBundle(b.id)
                      }}
                      className="text-slate-500 hover:text-indigo-600"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteBundle(b.id)
                      }}
                      className="text-slate-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                  <div className="font-semibold uppercase truncate">
                    {b.name || "Bundle"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {formatRupiah(b.price || 0)}
                  </div>

                </div>

              ))}

              <Button
                className="w-full"
                onClick={addBundle}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bundle
              </Button>

            </>
          )}
          {mode === "types" && (
            <div className="shadow-md border rounded-xl p-4 mb-4">

              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Estimasi Pendapatan</h3>

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
                        Per Tiket
                      </TabButton>
                    </div>

                    {/* ==================== CALC PANEL ==================== */}
                    <div className=" rounded-2xl p-3 shadow-sm space-y-4">

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

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}
        </div>

        {/* MAIN PANEL */}
        <div className="lg:col-span-8">

          {/* FORM AREA */}
          {mode === "types" && activeTicket && (
            <div className="bg-white rounded-2xl shadow-md border p-6 space-y-6">

              <FormSelect
                label="Ticket Group"
                required
                value={activeTicket.group}
                onChange={(value) => update("group", value)}
                items={parseGroup}
                itemLabel="name"
                itemValue="id"
                placeholder="Pilih Ticket Group"
              />
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
                    min="1"
                    disabled={isLocked}
                    value={activeTicket.qty}
                    onChange={(e) => update("qty", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max / Order *</label>
                  <Input
                    type="number"
                    min="1"
                    value={activeTicket.maxOrder}
                    onChange={(e) => update("maxOrder", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <SwitchRow
                  label="Admin Fee"
                  desc={activeTicket.adminFeeIncluded ? "Dibayar oleh Buyer" : "Ditanggung Organizer"}
                  active={activeTicket.adminFeeIncluded}
                  onClick={() => update("adminFeeIncluded", !activeTicket.adminFeeIncluded)}
                />

                <SwitchRow
                  label={`Tax (${taxPercent}%)`}
                  desc={activeTicket.taxIncluded ? "Dibayar oleh Buyer" : "Ditanggung Organizer"}
                  active={activeTicket.taxIncluded}
                  onClick={() => update("taxIncluded", !activeTicket.taxIncluded)}
                />
              </div>

              {/* DATES */}
              <div className="grid sm:grid-cols-2 gap-4">

                <div>
                  <label className="text-sm font-medium">Tanggal Mulai Penjualan *</label>
                  <Input
                    type="datetime-local"
                    min={`${today}T00:00`}
                    max={`${eventEndDate}T23:59`}
                    value={activeTicket.saleStart}
                    onChange={(e) => update("saleStart", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal Selesai Penjualan *</label>
                  <Input
                    type="datetime-local"
                    min={`${today}T00:00`}
                    max={`${eventEndDate}T23:59`}
                    value={activeTicket.saleEnd}
                    onChange={(e) => update("saleEnd", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal Kirim Tiket *</label>
                  <Input
                    type="datetime-local"
                    min={`${today}T00:00`}
                    max={`${eventEndDate}T23:59`}
                    value={activeTicket.deliverDate}
                    onChange={(e) => update("deliverDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tiket Berlaku Dari</label>

                  <Input
                    type="datetime-local"
                    min={`${eventStartDate}T00:00`}
                    max={`${eventEndDate}T23:59`}
                    value={activeTicket.validStart}
                    onChange={(e) => update("validStart", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tiket Berlaku Sampai</label>

                  <Input
                    type="datetime-local"
                    min={`${eventStartDate}T00:00`}
                    max={`${eventEndDate}T23:59`}
                    value={activeTicket.validEnd}
                    onChange={(e) => update("validEnd", e.target.value)}
                  />
                </div>

                <FormSelect
                  label="Jenis Tiket"
                  required
                  value={activeTicket.ticket_usage_type}
                  onChange={(value) => update("ticket_usage_type", value)}
                  items={[

                    { id: "single_entry", name: "Single Entry" },

                    { id: "daily_entry", name: "Daily Entry" },

                    { id: "multi_entry", name: "Multi Entry" }
                  ]}
                  itemLabel="name"
                  itemValue="id"
                  placeholder="Pilih Jenis Tiket"
                />

              </div>
            </div>
          )}

          {mode === "bundles" && activeBundle && (

            <div className="bg-white rounded-2xl shadow-md border p-6 space-y-6 ">

              <h3 className="font-semibold text-lg">
                Bundle Ticket
              </h3>

              <div>
                <label>Nama Bundle *</label>
                <Input
                  value={activeBundle.name}
                  onChange={(e) => updateBundle("name", e.target.value)}
                />
                {bundleErrors?.[safeIndex]?.name && (
                  <p className="text-red-500 text-xs">
                    {bundleErrors[safeIndex].name}
                  </p>
                )}
              </div>

              <div>
                <label>Harga *</label>
                <Input
                  value={formatRupiah(activeBundle.price)}
                  onChange={(e) =>
                    updateBundle("price", parseRupiah(e.target.value))
                  }
                />
                {bundleErrors?.[safeIndex]?.price && (
                  <p className="text-red-500 text-xs">
                    {bundleErrors[safeIndex].price}
                  </p>
                )}
              </div>

              <h4 className="font-semibold">
                Isi Bundle
              </h4>

              <DndContext collisionDetection={closestCenter}>

                <div className="space-y-3">

                  {activeBundle.items.map((item, i) => (

                    <div
                      key={i}
                      className="flex gap-3 p-3 border rounded-lg bg-slate-50"
                    >

                      <select
                        className="border rounded p-2 flex-1"
                        value={item.ticket_type_id}
                        onChange={(e) => updateBundleItem(i, "ticket_type_id", e.target.value)}
                      >

                        <option value="">Pilih Ticket</option>

                        {tickets.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}

                      </select>

                      {bundleErrors?.[safeIndex]?.[`item_${i}_ticket`] && (
                        <p className="text-red-500 text-xs">
                          {bundleErrors[safeIndex][`item_${i}_ticket`]}
                        </p>
                      )}

                      <Input
                        type="number"
                        min="1"
                        className="w-24"
                        value={item.quantity}
                        onChange={(e) => updateBundleItem(i, "quantity", e.target.value)}
                      />

                      <button
                        onClick={() => removeBundleItem(i)}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  ))}

                </div>

              </DndContext>

              <Button
                variant="outline"
                onClick={addBundleItem}
              >
                Tambah Item
              </Button>

            </div>

          )}
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
      className={`px-4 py-2 rounded-lg transition cursor-pointer ${active
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