"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import BaseModal from "@/components/common/BaseModal";
import DataTables from "@/components/common/DataTables";

import { creatorApi, fetcher } from "@/lib/creatorsApi";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/common/DropdownTable";

import { Eye, Trash2, MoreHorizontal, BadgeCheck, BadgeX } from "lucide-react";
import { confirmAlert, successAlert } from "@/lib/alert";
import { formatTanggalJamIndo, formatEventDateTime } from "@/utils/date";

export default function CreatorManagement() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const [openDetail, setOpenDetail] = useState(false);
    const [selected, setSelected] = useState(null);
    const [activeTab, setActiveTab] = useState("info");

    /* ============================================================
       🟦 SWR — Realtime Pagination Fetch
    ============================================================ */
    const paginationURL = creatorApi.paginated(page, perPage, search);

    const { data: paged, isLoading } = useSWR(paginationURL, fetcher);

    const data = paged?.data || [];
    const meta = paged?.meta || {};
    const mediaBase = paged?.media || "";

    /* ============================================================
       🟦 SWR — Detail (Documents / Finance / Bank)
    ============================================================ */
    const documentsURL = selected ? creatorApi.documents(selected.id) : null;
    const financeURL = selected ? creatorApi.finance(selected.id) : null;
    const bankURL = selected ? creatorApi.bank(selected.id) : null;

    const { data: documents } = useSWR(documentsURL, fetcher);
    const { data: finance } = useSWR(financeURL, fetcher);
    const { data: bankAccounts } = useSWR(bankURL, fetcher);

    /* ============================================================
       Open Detail
    ============================================================ */
    const handleDetail = (row) => {
        setSelected(row);
        setActiveTab("info");
        setOpenDetail(true);
    };

    /* ============================================================
       DELETE
    ============================================================ */
    const handleDelete = async (row) => {
        const res = await confirmAlert({
            title: "Hapus Creator?",
            text: `Creator "${row.name}" akan dihapus permanen.`,
            confirmText: "Hapus",
        });

        if (!res.isConfirmed) return;

        await creatorApi.delete(row.id);
        await successAlert("Berhasil", "Creator dihapus.");
        mutate(paginationURL);
    };

    /* ============================================================
       TABLE COLUMNS
    ============================================================ */
    const columns = [
        { key: "image", label: "Image", type: "image" },
        { key: "name", label: "Nama" },
        { key: "author", label: "Owner" },

        // Admin Fee
        {
            key: "admin_fee",
            label: "Admin Fee",
            render: (row) => {
                if (!row.financial) return "-";

                return row.financial.admin_fee_type === "percent"
                    ? `${row.financial.admin_fee_value}%`
                    : `Rp ${Number(row.financial.admin_fee_value).toLocaleString("id-ID")}`;
            },
        },

        // Dokumen
        {
            key: "document_status",
            label: "Dokumen",
            render: (row) => {
                const ok =
                    row.document?.ktp_number ||
                    row.document?.npwp_number ||
                    row.document?.legal_type;

                return (
                    <span
                    >
                        {ok ? <BadgeCheck className="text-green-700"/> : <BadgeX className="text-red-600"/>}
                    </span>
                );
            },
        },

        // Bank
        {
            key: "bank_status",
            label: "Bank",
            render: (row) => (
                <span>
                    {row.bank?.is_verified ? <BadgeCheck className="text-green-700"/> : <BadgeX className="text-red-600"/>}
                </span>
            ),
        },

        { key: "total_events", label: "Total Event" },
        { key: "createdAt", label: "Tanggal Bergabung" },

        {
            key: "action",
            label: "Action",
            align: "center",
            render: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDetail(row)}>
                            <Eye className="h-4 w-4" /> Detail
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(row)}
                        >
                            <Trash2 size={16} /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    /* ============================================================
       RENDER
    ============================================================ */
    return (
        <>
            <DataTables
                title="Organizer Management"
                description="Kelola data Organizer di platform"
                columns={columns}
                data={
                    data.map((item) => ({
                        ...item,
                        mediaBase,
                        author: item.owner?.full_name || "-",
                        image: item.image
                            ? `${mediaBase}${item.image.replace(/^\/+/, "")}`
                            : null,
                        createdAt: formatTanggalJamIndo(item.created_at),
                    })) || []
                }
                loading={isLoading}
                meta={meta}
                onSearch={(v) => setSearch(v)}
                onPageChange={(p) => setPage(p)}
                onPerPageChange={(v) => setPerPage(v)}
            />

            {/* MODAL DETAIL */}
            <BaseModal
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                maxWidth="max-w-4xl"
                title="Detail Organizer"
            >
                {selected && (
                    <DetailOrganizer
                        selected={selected}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        documents={documents?.data}
                        finance={finance?.data}
                        bankAccounts={bankAccounts?.data}
                    />
                )}
            </BaseModal>
        </>
    );
}

/* ========================================================================
   SUB COMPONENTS
======================================================================== */

function DetailOrganizer({ selected, activeTab, setActiveTab, documents, finance, bankAccounts }) {
    return (
        <div className="space-y-6">

            {/* PROFILE */}
            <CreatorProfile selected={{
                ...selected,
                document: documents,
                bank_verified: bankAccounts?.[0]?.is_verified
            }} />

            {/* TABS */}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* CONTENT SWITCHING */}
            {activeTab === "info" && (
                <EventList selected={selected} />
            )}

            {activeTab === "finance" && (
                <FinanceSettingsTab
                    creatorId={selected.id}
                    finance={finance}
                />
            )}

            {activeTab === "documents" && (
                <CreatorDocumentsTab docs={documents} />
            )}

            {activeTab === "bank" && (
                <BankAccountsTab banks={bankAccounts || []} />
            )}
        </div>
    );
}

function Tabs({ activeTab, setActiveTab }) {
    const items = [
        { key: "info", label: "Profil & Events" },
        { key: "finance", label: "Finance" },
        { key: "documents", label: "Documents" },
        { key: "bank", label: "Bank Accounts" },
    ];

    return (
        <div className="flex gap-4 border-b pb-2 text-sm">
            {items.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-2 pb-1 border-b-2 ${activeTab === tab.key
                        ? "border-blue-600 text-blue-600 font-semibold"
                        : "border-transparent text-gray-500"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function CreatorProfile({ selected }) {
    return (
        <div className="flex gap-6 items-start p-4 bg-gray-50 rounded-xl border">

            {/* IMAGE */}
            <div className="">
                {selected.image ? (
                    <img
                        src={selected.image}
                        className="w-28 h-28 rounded-xl object-cover border shadow-sm"
                    />
                ) : (
                    <div className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center">
                        No Image
                    </div>
                )}
            </div>

            {/* MAIN INFO */}
            <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold capitalize">{selected.name}</h3>
                <p className="text-sm text-gray-500">
                    Dibuat oleh: <span className="font-medium">{selected.author}</span>
                </p>

                <div className="flex gap-3 mt-2 text-xs">
                    <span
                        className={`px-3 py-1 rounded-full ${selected.total_events === 0
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                            }`}
                    >
                        {selected.total_events} Events
                    </span>

                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                        Joined: {selected.createdAt}
                    </span>
                </div>

                {/* ADMIN FEE SUMMARY */}
                {selected.admin_fee_type && (
                    <div className="mt-3 text-sm">
                        <strong>Admin Fee: </strong>
                        {selected.admin_fee_type === "percent"
                            ? `${selected.admin_fee_value}%`
                            : `Rp ${Number(selected.admin_fee_value).toLocaleString("id-ID")}`}
                    </div>
                )}

                {/* STATUS */}
                <div className="flex gap-3 mt-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${selected.document?.ktp_number ||
                        selected.document?.npwp_number ||
                        selected.document?.legal_type
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                        Dokumen: {selected.document ? "Lengkap" : "Belum Lengkap"}
                    </span>

                    <span className={`px-3 py-1 text-xs rounded-full ${selected.bank_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                        Bank: {selected.bank_verified ? "Verified" : "Belum Verified"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function EventList({ selected }) {
    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-lg">Event List</h4>

            {selected.events.length === 0 ? (
                <p className="text-gray-500 italic">Tidak ada event.</p>
            ) : (
                selected.events.map((ev, i) => (
                    <div
                        key={i}
                        className="flex gap-4 items-center p-2 border-b"
                    >
                        <img
                            src={`${selected.mediaBase}${ev.image.replace(/^\/+/, "") || ""}`}
                            className="w-20 h-20 object-cover rounded border"
                        />

                        <div className="flex-1">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold capitalize text-base truncate max-w-80">
                                    {ev.name}
                                </span>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${ev.status === "published"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {ev.status}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500">
                                {ev.province}, {ev.district}
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                                {formatEventDateTime({
                                    startDate: ev.date_start,
                                    startTime: ev.time_start,
                                    endDate: ev.date_end,
                                    endTime: ev.time_end,
                                    zone: ev.timezone,
                                })}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

/* ==============================================================
   FINANCE SETTINGS TAB
=============================================================== */
function FinanceSettingsTab({ creatorId, finance }) {
    const [form, setForm] = useState({
        admin_fee_type: finance?.admin_fee_type || "percent",
        admin_fee_value: finance?.admin_fee_value || 0,
    });

    const saveFinance = async () => {
        await creatorApi.updateFinance(creatorId, form);

        mutate(creatorApi.finance(creatorId)); // realtime update

        successAlert("Berhasil", "Finance setting disimpan");
    };

    return (
        <div className="mt-4">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Pengaturan Admin Fee
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Fee Type
                        </label>

                        <select
                            value={form.admin_fee_type}
                            onChange={(e) =>
                                setForm({ ...form, admin_fee_type: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="percent">Percent (%)</option>
                            <option value="flat">Flat (Rp)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Fee Value
                        </label>

                        <input
                            type="number"
                            value={form.admin_fee_value}
                            onChange={(e) =>
                                setForm({ ...form, admin_fee_value: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>
                </div>

                <Button onClick={saveFinance}>Simpan</Button>
            </div>
        </div>
    );
}

/* ==============================================================
   DOCUMENTS TAB
=============================================================== */
function CreatorDocumentsTab({ docs }) {
    if (!docs) return <p className="italic text-gray-500">Tidak ada dokumen.</p>;

    return (
        <div className="space-y-4 text-sm">
            <Field label="KTP Number" value={docs.ktp_number} />
            {docs.ktp_image && <img src={docs.ktp_image} className="w-40" />}

            <Field label="NPWP Number" value={docs.npwp_number} />
            {docs.npwp_image && <img src={docs.npwp_image} className="w-40" />}

            <Field label="Legal Type" value={docs.legal_type} />
            <Field label="Legal Name" value={docs.legal_name} />
            {docs.legal_doc && <img src={docs.legal_doc} className="w-40" />}
        </div>
    );
}

const Field = ({ label, value }) => (
    <p>
        <strong>{label}:</strong> {value || "-"}
    </p>
);

/* ==============================================================
   BANK ACCOUNTS TAB
=============================================================== */
function BankAccountsTab({ banks }) {
    if (!banks.length) return <p className="italic text-gray-500">Tidak ada bank account.</p>;

    return (
        <div className="space-y-4">
            {banks.map((b, i) => (
                <div key={i} className="border p-3 rounded-lg">
                    <Field label="Bank" value={b.bank_name} />
                    <Field label="No Rekening" value={b.account_number} />
                    <Field label="Pemilik" value={b.account_holder} />

                    <span
                        className={`px-2 py-1 text-xs rounded ${b.is_verified
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                    >
                        {b.is_verified ? "Verified" : "Not Verified"}
                    </span>
                </div>
            ))}
        </div>
    );
}