"use client";

import { useState } from "react";
import useSWR from "swr";

import DataTablesEnterprise from "@/components/common/DataTables";
import BaseModal from "@/components/common/BaseModal";
import DateFilterModal from "@/components/common/orders/DateFilterModal";

import {
  getOrders,
  getOrderDetail,
  exportCSV,
  exportXLSX,
  exportPDF,
  resendTicket
} from "@/lib/orderApi";

import { getAllEventByCreator } from "@/lib/eventApi";

import { Button } from "@/components/ui/button";
import { formatIsoIndo, formatRupiah } from "@/utils/date";

import { confirmAlert, successAlert, errorAlert } from "@/lib/alert";

// ⚡ NEW IMPORTS — shadcn Select
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/selects";

// ⚡ NEW IMPORTS — lucide-react icons
import {
  ShoppingCart,
  Ticket,
  Wallet,
  DollarSign,
  Calendar,
  Eye
} from "lucide-react";

async function handleResend(orderId) {
  try {
    const confirm = await confirmAlert({
      title: "Kirim Ulang Ticket?",
      text: "Ticket akan dikirim ulang ke email pembeli.",
      confirmText: "Ya, kirim ulang",
      cancelText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    const res = await resendTicket(orderId);

    if (res?.success) {
      await successAlert("Berhasil!", "Ticket berhasil dikirim ulang.");
    } else {
      await errorAlert("Gagal", res?.message || "Gagal mengirim ulang ticket.");
    }
  } catch (err) {
    await errorAlert("Error", err.message || "Terjadi kesalahan.");
  }
}

function toLocalDateOnly(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-CA");
}

export default function OrdersManage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [eventId, setEventId] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("ALL");

  const [openCalendarFilter, setOpenCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const { startDate, endDate } = dateRange[0];

  const { data: eventList } = useSWR("/events-by-creator", getAllEventByCreator);

  const { data, isLoading } = useSWR(
    [
      "/orders",
      page,
      perPage,
      search,
      status,
      eventId,
      paymentMethod,
      startDate,
      endDate,
    ],
    () =>
      getOrders({
        page,
        perPage,
        search,
        status,
        event_id: eventId,
        payment_method: paymentMethod,
        start_date: toLocalDateOnly(startDate),
        end_date: toLocalDateOnly(endDate),
      })
  );

  const rows = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    {
      key: "invoice_no",
      label: "Invoice",
      render: (row) => (
        <span className="font-mono text-sm">{row.invoice_no}</span>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      render: (row) => (
        <div>
          <p className="font-medium">{row.customer_name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            📧 {row.customer_email}
          </p>
        </div>
      ),
    },
    { key: "event_name", label: "Event" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "PAID"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "total_amount",
      label: "Total",
      render: (row) => formatRupiah(row.total_amount),
    },
    {
      key: "payment",
      label: "Payment",
      render: (row) => (
        <div className="space-y-1">
          <p className="font-medium">{row.payment?.method}</p>
          <p
            className={`text-xs ${
              row.payment?.status === "PAID"
                ? "text-green-600"
                : row.payment?.status === "PENDING"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {row.payment?.status}
          </p>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => formatIsoIndo(row.created_at),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => setSelectedId(row.id)}
        >
          <Eye size={14} /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

      {/* KPI CARDS */}
      {data?.data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Kpi title="Total Orders" icon={<ShoppingCart size={22} />} value={data.data.summary.total_orders} />
          <Kpi title="Total Ticket Qty" icon={<Ticket size={22} />} value={data.data.summary.total_ticket_qty} />
          <Kpi title="Total Revenue" icon={<DollarSign size={22} />} value={formatRupiah(data.data.summary.total_revenue)} />
          <Kpi title="Organizer Net" icon={<Wallet size={22} />} value={formatRupiah(data.data.summary.total_organizer_net)} />
        </div>
      )}

      {/* FILTER BAR */}
      <div className="p-4 bg-white rounded-xl shadow flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">

          {/* Event Dropdown */}
          <Select onValueChange={setEventId} value={eventId}>
            <SelectTrigger className="w-[150px] bg-slate-50">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Events</SelectItem>
              {eventList?.map((ev) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Dropdown */}
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger className="w-[150px] bg-slate-50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PAID">PAID</SelectItem>
              <SelectItem value="WAITING_PAYMENT">WAITING PAYMENT</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="EXPIRED">EXPIRED</SelectItem>
              <SelectItem value="CANCELED">CANCELED</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Method */}
          {/* <Select onValueChange={setPaymentMethod} value={paymentMethod}>
            <SelectTrigger className="w-[160px] bg-slate-50">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              <SelectItem value="INVOICE">Invoice</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
              <SelectItem value="VA">Virtual Account</SelectItem>
              <SelectItem value="EWALLET">E-Wallet</SelectItem>
            </SelectContent>
          </Select> */}

          {/* Date */}
          <Button variant="outline" onClick={() => setOpenCalendar(true)} className="flex items-center gap-2">
            <Calendar size={16} /> Date
          </Button>

          <DateFilterModal
            open={openCalendarFilter}
            onClose={() => setOpenCalendar(false)}
            onApply={({ startDate, endDate }) =>
              setDateRange([{ startDate, endDate, key: "selection" }])
            }
          />
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV({ search, status, payment_method: paymentMethod, event_id: eventId })}>
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportXLSX({ search, status, payment_method: paymentMethod, event_id: eventId })}>
            XLSX
          </Button>
          <Button variant="outline" onClick={() => exportPDF({ search, status, payment_method: paymentMethod, event_id: eventId })}>
            PDF
          </Button>
        </div>
      </div>

      <DataTablesEnterprise
        title="Order List"
        data={rows}
        columns={columns}
        meta={meta}
        loading={isLoading}
        onSearch={setSearch}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      <OrderModal orderId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

// ===================================================
// ORDER MODAL
// ===================================================
function OrderModal({ orderId, onClose }) {
  const { data } = useSWR(
    orderId ? ["order-detail", orderId] : null,
    () => getOrderDetail(orderId)
  );

  const order = data?.data?.data;
  if (!order) return null;

  return (
    <BaseModal open onClose={onClose} title="Order Detail">
      <div className="space-y-8">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 shadow-inner">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Invoice #{order.invoice_no}
            </h2>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.payment?.status === "PAID"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {order.payment?.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-xs">{order.customer_email}</p>
              <p className="text-xs">{order.customer_phone}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Event</p>
              <p className="font-medium">{order.event_name}</p>

              <p className="text-xs mt-2 text-slate-500">
                Total Dibayar
              </p>
              <p className="text-lg font-bold text-blue-600">
                {formatRupiah(order.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div>
          <h3 className="font-semibold mb-3">Status Timeline</h3>

          <div className="space-y-4 border-l pl-6">
            {order.timeline.map((step) => (
              <div key={step.key} className="relative">
                <div
                  className={`absolute -left-4 top-1 w-3 h-3 rounded-full ${
                    step.active ? "bg-blue-600" : "bg-slate-400"
                  }`}
                />

                <p className={`${step.active ? "font-semibold text-blue-600" : "text-slate-600"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500">
                  {step.date ? formatIsoIndo(step.date) : "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ITEMS */}
        <div className="space-y-4">
          <h3 className="font-semibold">Items</h3>

          {order.items.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-50 p-4 shadow">
              <p className="font-bold uppercase mb-1">{item.ticket_type_name}</p>

              <p className="text-sm">
                {item.quantity} × {formatRupiah(item.ticket_price)}
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Admin Fee: {formatRupiah(item.admin_fee)}
              </p>
              <p className="text-xs text-slate-600">
                Pajak: {formatRupiah(item.tax)}
              </p>

              <p className="font-semibold mt-2">
                Total: {formatRupiah(item.total_price)}
              </p>

              {item.tickets.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-600">Lihat Tickets</summary>
                  <div className="mt-2 space-y-1 pl-4 border-l text-xs text-slate-600">
                    {item.tickets.map((t) => (
                      <p key={t.ticket_code}>
                        • {t.ticket_code} — {t.owner_name} ({t.owner_email})
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-[10px] ${
                            t.status === "issued"
                              ? "bg-yellow-100 text-yellow-700"
                              : t.status === "sent"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* FINANCE SUMMARY */}
        <div>
          <h3 className="font-semibold">Ringkasan Fee</h3>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow space-y-2">
            <Row label="Subtotal Tiket" value={formatRupiah(order.finance_summary.ticket_subtotal)} />
            <Row label="Total Admin Fee" value={formatRupiah(order.finance_summary.admin_fee_total)} />
            <Row label="Total Pajak" value={formatRupiah(order.finance_summary.tax_total)} />

            <hr />

            <Row
              label="Grand Total"
              value={formatRupiah(order.finance_summary.grand_total)}
              bold
            />
          </div>
        </div>

        {/* PAYMENT */}
        <div>
          <h3 className="font-semibold">Payment</h3>

          <div className="grid grid-cols-2 gap-4">
            <Info label="Method" value={order.payment?.method} />
            <Info label="Status" value={order.payment?.status} />
            <Info label="Amount" value={formatRupiah(order.payment?.amount)} />
            <Info label="Paid At" value={order.payment?.paid_at ? formatIsoIndo(order.payment.paid_at) : "-"} />
          </div>
        </div>

        {/* RESEND */}
        {order.resend_available && (
          <Button
            className="w-full bg-blue-600 text-white font-semibold"
            onClick={() => handleResend(orderId)}
          >
            Resend Ticket
          </Button>
        )}
      </div>
    </BaseModal>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}

function Kpi({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-white to-teal-50 border shadow p-5 rounded-xl flex flex-col gap-2">
      <div className="text-xs uppercase text-slate-400">{title}</div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">{value}</div>
        <div className="text-blue-700">{icon}</div>
      </div>
    </div>
  );
}