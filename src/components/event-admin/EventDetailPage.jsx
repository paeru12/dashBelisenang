"use client";

import { useState, useMemo } from "react";
import { formatEventDateTime } from "@/utils/date";
import { Button } from "@/components/ui/button";
import EventEditPopup from "./EventEditPopup";
import { buildMediaUrl } from "@/utils/buildMediaUrl";
import SectionCard from "@/components/common/SectionCard";
import { Instagram, Globe, Facebook, Youtube, Music, Trash2 } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    Legend,
} from "recharts";
import PopupGuestStar from "@/components/event-admin/PopupGuestStar";
import PopupSponsor from "@/components/event-admin/PopupSponsor";
import PopupFasilitas from "@/components/event-admin/PopupFasilitas";
import PopupAssignScanStaff from "@/components/event-admin/PopupAssignScanStaff";
import { deleteGuestStar, deleteSponsor, deleteEventFasilitas } from "@/lib/eventExtrasApi";
import {
    successAlert,
    errorAlert,
    confirmAlert,
} from "@/lib/alert";
export default function EventDetailPage({ event, media, onRefresh }) {
    const [activeTab, setActiveTab] = useState("deskripsi");
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);
    const [openGuest, setOpenGuest] = useState(false);
    const [openSponsor, setOpenSponsor] = useState(false);
    const [openFasilitas, setOpenFasilitas] = useState(false);
    const [openScanStaff, setOpenScanStaff] = useState(false);
    const imageUrl = media
        ? `${media}${event.image?.replace(/^\/+/, "")}`
        : null;

    const tickets = event.ticket_types || [];

    /* ================= KPI ================= */

    const totalRevenue = tickets.reduce(
        (acc, t) =>
            acc + Number(t.ticket_sold || 0) * Number(t.price || 0),
        0
    );

    const totalSold = tickets.reduce(
        (acc, t) => acc + Number(t.ticket_sold || 0),
        0
    );

    const totalStock = tickets.reduce(
        (acc, t) => acc + Number(t.total_stock || 0),
        0
    );

    const remaining = totalStock - totalSold;

    /* ================= CHART DATA ================= */

    const salesData = tickets.map((t) => ({
        name: t.name,
        sold: Number(t.ticket_sold || 0),
        revenue: Number(t.ticket_sold || 0) * Number(t.price || 0),
    }));

    // Dummy timeline revenue example (replace with real backend data later)
    const timelineData = useMemo(() => {
        return [
            { date: "Day 1", revenue: totalRevenue * 0.1 },
            { date: "Day 2", revenue: totalRevenue * 0.25 },
            { date: "Day 3", revenue: totalRevenue * 0.4 },
            { date: "Day 4", revenue: totalRevenue * 0.7 },
            { date: "Today", revenue: totalRevenue },
        ];
    }, [totalRevenue]);

    const eventWithMedia = {
        ...event,
        image: buildMediaUrl(media, event.image),
        layout_venue: buildMediaUrl(media, event.layout_venue),
    };

    const handleDeleteGuest = async (guestId) => {
        const confirm = await confirmAlert({
            title: "Hapus Guest Star?",
            text: "Data tidak dapat dikembalikan",
        });

        if (!confirm.isConfirmed) return;

        try {
            await deleteGuestStar(event.id, guestId);
            successAlert("Berhasil", "Guest Star dihapus");
            onRefresh();
        } catch (err) {
            errorAlert("Gagal", "Gagal menghapus");
        }
    };

    const handleDeleteSponsor = async (SponsorId) => {
        const confirm = await confirmAlert({
            title: "Hapus Sponsor?",
            text: "Data tidak dapat dikembalikan",
        });

        if (!confirm.isConfirmed) return;

        try {
            await deleteSponsor(event.id, SponsorId);
            successAlert("Berhasil", "Sponsor dihapus");
            onRefresh();
        } catch (err) {
            errorAlert("Gagal", "Gagal menghapus");
        }
    };

    const handleDeleteFasilitas = async (FasilitasId) => {
        const confirm = await confirmAlert({
            title: "Hapus Fasilitas?",
            text: "Data tidak dapat dikembalikan",
        });

        if (!confirm.isConfirmed) return;

        try {
            await deleteEventFasilitas(event.id, FasilitasId);
            successAlert("Berhasil", "Fasilitas dihapus");
            onRefresh();
        } catch (err) {
            errorAlert("Gagal", "Gagal menghapus");
        }
    };


    return (
        <div className=" sm:px-4 lg:px-4 py-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* ================= MAIN ================= */}
                <div className="xl:col-span-3 space-y-8">

                    {/* HERO SECTION */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl border bg-white">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={event.name}
                                className="w-full object-cover max-h-[480px]"
                            />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                No Event Poster
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Hero Info */}
                        <div className="absolute bottom-0 p-6 text-white w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="px-3 py-1 capitalize text-xs rounded-full bg-white/20 backdrop-blur">
                                    {event.kategoris?.name || "Uncategorized"}
                                </span>
                                <span className="px-3 py-1 capitalize text-xs rounded-full bg-white/20 backdrop-blur">
                                    {event.province || "Uncategorized"}
                                </span>
                                <span className="px-3 py-1 capitalize text-xs rounded-full bg-white/20 backdrop-blur">
                                    {event.district || "Uncategorized"}
                                </span>
                                <span
                                    className={`px-3 py-1 text-xs capitalize rounded-full backdrop-blur font-medium
                                        ${event.status === "published"
                                            ? "bg-green-500"
                                            : event.status === "draft"
                                                ? "bg-red-500"
                                                : event.status === "ended"
                                                    ? "bg-gray-400"
                                                    : "bg-white/20 text-white"
                                        }
                                    `}
                                >
                                    {event.status}
                                </span>

                            </div>

                            <h1 className="text-sm md:text-xl lg:text-2xl font-bold capitalize">
                                {event.name}
                            </h1>
                        </div>
                    </div>

                    {/* KPI */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <Kpi title="Revenue" value={`Rp ${totalRevenue.toLocaleString("id-ID")}`} />
                        <Kpi title="Sold" value={totalSold} />
                        <Kpi title="Remaining" value={remaining} />
                        <Kpi title="Ticket Types" value={tickets.length} />
                    </div>

                    {/* SALES BAR CHART */}
                    <SectionCard title="Ticket Sales">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sold" fill="#4f46e5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>

                    {/* TIMELINE REVENUE */}
                    <SectionCard title="Revenue Timeline">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>


                    {/* ================= DETAIL SectionCard ================= */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

                        {/* HEADER */}
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 flex-1">

                                    <InfoItem label="Organizer" value={event.creators?.name} />
                                    <InfoItem label="Author" value={event.users?.full_name} />

                                    <InfoItem
                                        label="Tanggal & Waktu"
                                        value={formatEventDateTime({
                                            startDate: event.date_start,
                                            startTime: event.time_start,
                                            endDate: event.date_end,
                                            endTime: event.time_end,
                                            zone: event.timezone,
                                        })}
                                    />

                                    <InfoItem label="Lokasi" value={event.location} />
                                </div>

                                <Button
                                    size="lg"
                                    className="rounded-xl"
                                    onClick={() => {
                                        setDialogMode("event");
                                        setOpenDialog(true);
                                    }}
                                >
                                    Edit Event
                                </Button>
                            </div>
                        </div>

                        <div className="px-6 sm:px-10 pb-10 space-y-10">

                            {/* PRICE */}
                            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white shadow-md">
                                <div className="text-xs uppercase tracking-wide opacity-80 mb-1">
                                    Starting Price
                                </div>
                                <div className="text-lg sm:text-2xl font-bold">
                                    Rp {Number(event.lowest_price).toLocaleString("id-ID")}
                                </div>
                            </div>

                            {/* TABS */}
                            <div>
                                <div className="inline-flex bg-slate-100 rounded-xl p-1 mb-6 text-sm sm:text-base">
                                    <TabButton
                                        active={activeTab === "deskripsi"}
                                        onClick={() => setActiveTab("deskripsi")}
                                    >
                                        Deskripsi
                                    </TabButton>

                                    <TabButton
                                        active={activeTab === "sk"}
                                        onClick={() => setActiveTab("sk")}
                                    >
                                        Syarat & Ketentuan
                                    </TabButton>
                                </div>

                                <div className="prose max-w-none text-sm sm:text-base text-slate-700">
                                    {activeTab === "deskripsi" && (
                                        <div dangerouslySetInnerHTML={{ __html: event.deskripsi }} />
                                    )}
                                    {activeTab === "sk" && (
                                        <div dangerouslySetInnerHTML={{ __html: event.sk }} />
                                    )}
                                </div>
                            </div>

                            {/* TICKET TYPES (TIDAK DIUBAH) */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 flex-1">
                                    <SectionTitle>Ticket Types</SectionTitle>
                                    <Button
                                        size="lg"
                                        className="rounded-xl"
                                        onClick={() => {
                                            setDialogMode("ticket");
                                            setOpenDialog(true);
                                        }}
                                    >
                                        Edit Ticket
                                    </Button>
                                </div>
                                {tickets.map((ticket) => {
                                    const sold = Number(ticket.ticket_sold || 0);
                                    const total = Number(ticket.total_stock || 0);
                                    const percentage = total > 0 ? (sold / total) * 100 : 0;
                                    const revenue = sold * Number(ticket.price);

                                    return (
                                        <div
                                            key={ticket.id}
                                            className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-lg font-semibold capitalize">
                                                        {ticket.name}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        Max/order: {ticket.max_per_order}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Revenue: Rp {revenue.toLocaleString("id-ID")}
                                                    </p>
                                                </div>

                                                <div className="lg:text-right space-y-2">
                                                    <div className="text-lg font-bold text-indigo-600">
                                                        Rp {Number(ticket.price).toLocaleString("id-ID")}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {sold}/{total} sold
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 transition-all duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT SIDEBAR ================= */}
                <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 xl:block xl:space-y-6 md:sticky md:top-6 h-fit">

                    <SectionCard
                        title="Scan Staff"
                        rightAction={<Button size="sm" onClick={() => setOpenScanStaff(true)}>+</Button>}
                    >

                        {event.scan_staffs?.length === 0 && (
                            <p className="text-xs text-slate-400 italic">
                                Belum ada staff scan
                            </p>
                        )}

                        {event.scan_staffs?.map((staff) => (
                            <div key={staff.id} className="border-b py-2 flex justify-between items-center">

                                <div>
                                    <p className="text-sm font-medium capitalize">{staff.user?.full_name}</p>
                                    <p className="text-xs text-slate-500">
                                        Gate : {staff.assigned_gate}
                                    </p>
                                </div>

                                <span className={`text-xs px-2 py-1 rounded-full
                                    ${staff.status === "accepted"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"}
                                    `}>
                                    {staff.status}
                                </span>

                            </div>
                        ))}

                    </SectionCard>

                    {/* LAYOUT VENUE */}
                    <SectionCard title="Layout Venue">
                        <a href={event.map} target="_blank" className="text-xs text-slate-500  hover:underline">Link Maps</a>

                        {event.layout_venue ? (
                            <img
                                src={`${media}${event.layout_venue?.replace(/^\/+/, "")}`}
                                alt="Layout Venue"
                                className="w-full rounded-lg border"
                            />
                        ) : (
                            <p className="text-xs text-slate-400 italic">
                                Belum ada layout venue
                            </p>
                        )}
                    </SectionCard>

                    {/* SOSIAL MEDIA */}
                    <SectionCard title="Sosial Media">
                        {!event.social_link ||
                            Object.values(event.social_link).every((v) => !v) ? (
                            <p className="text-xs text-slate-400 italic">Tidak ada sosial media</p>
                        ) : (
                            <div className="space-y-3">

                                {Object.entries(event.social_link).map(([platform, rawUrl]) => {
                                    if (!rawUrl) return null;

                                    // Auto detect & build full URL
                                    const url = rawUrl.startsWith("http")
                                        ? rawUrl
                                        : rawUrl.includes(".")
                                            ? "https://" + rawUrl
                                            : `https://${platform}.com/${rawUrl}`;

                                    const icons = {
                                        instagram: <Instagram className="w-4 h-4 text-pink-500" />,
                                        tiktok: <Music className="w-4 h-4 text-black" />,
                                        facebook: <Facebook className="w-4 h-4 text-blue-600" />,
                                        youtube: <Youtube className="w-4 h-4 text-red-600" />,
                                        website: <Globe className="w-4 h-4 text-emerald-600" />,
                                    };

                                    const labels = {
                                        instagram: "Instagram",
                                        tiktok: "TikTok",
                                        facebook: "Facebook",
                                        youtube: "YouTube",
                                        website: "Website",
                                    };

                                    return (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            className="flex items-center gap-3 group p-2 rounded-lg hover:bg-slate-100 transition"
                                        >
                                            {icons[platform]}

                                            <span className="font-medium group-hover:text-indigo-600">
                                                {labels[platform]}
                                            </span>

                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    {/* GUEST STAR */}
                    <SectionCard title="Guest Star" rightAction={<Button size="sm" onClick={() => setOpenGuest(true)}>+</Button>}>
                        {event.guest_stars?.map((guest) => (
                            <div key={guest.id} className="">
                                <div className="grid grid-cols-4 py-1 items-center gap-2 border-b">
                                    <img
                                        src={`${media}${guest.image?.replace(/^\/+/, "")}`}
                                        alt={guest.name}
                                        className="w-10 h-10 rounded-circle object-cover border"
                                    />
                                    <p className="mt-2 text-sm font-medium col-span-2 truncate">
                                        {guest.name}
                                    </p>
                                    <Button size="xs" variant="ghost" onClick={() => handleDeleteGuest(guest.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            </div>
                        ))}
                    </SectionCard>

                    {/* SPONSOR */}
                    <SectionCard title="Sponsor" rightAction={<Button size="sm" onClick={() => setOpenSponsor(true)}>+</Button>}>
                        {event.sponsors?.map((sponsor) => (
                            <div key={sponsor.id}>
                                <div className="grid grid-cols-4 py-1 items-center gap-2 border-b">
                                    <img
                                        src={`${media}${sponsor.image?.replace(/^\/+/, "")}`}
                                        alt={sponsor.name}
                                        className="w-10 h-10 rounded-circle object-cover border"
                                    />
                                    <p className="mt-2 text-sm font-medium col-span-2 truncate">
                                        {sponsor.name}
                                    </p>
                                    <Button size="xs" variant="ghost" onClick={() => handleDeleteSponsor(sponsor.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            </div>
                        ))}
                    </SectionCard>

                    {/* FASILITAS */}
                    <SectionCard title="Fasilitas" rightAction={<Button size="sm" onClick={() => setOpenFasilitas(true)}>+</Button>}>
                        {event.fasilitas_event?.map((item) => (
                            <div key={item.id}>
                                <div className="grid grid-cols-4 py-1 items-center gap-2 border-b">
                                    <img
                                        src={`${media}${item.icon?.replace(/^\/+/, "")}`}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-circle object-cover border"
                                    />
                                    <p className="mt-2 text-sm font-medium col-span-2 truncate">
                                        {item.name}
                                    </p>
                                    <Button size="xs" variant="ghost" onClick={() => handleDeleteFasilitas(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
            <EventEditPopup
                open={openDialog}
                mode={dialogMode}
                event={eventWithMedia}
                onClose={() => setOpenDialog(false)}
                onSuccess={() => {
                    setOpenDialog(false);
                    onRefresh();
                }}
            />

            <PopupGuestStar
                open={openGuest}
                onClose={() => setOpenGuest(false)}
                eventId={event.id}
                onSuccess={() => {
                    setOpenGuest(false);
                    onRefresh();
                }}
            />

            <PopupSponsor
                open={openSponsor}
                onClose={() => setOpenSponsor(false)}
                eventId={event.id}
                onSuccess={() => {
                    setOpenSponsor(false);
                    onRefresh();
                }}
            />

            <PopupFasilitas
                open={openFasilitas}
                onClose={() => setOpenFasilitas(false)}
                event={event}
                onSuccess={() => {
                    setOpenFasilitas(false);
                    onRefresh();
                }}
            />

            <PopupAssignScanStaff
                open={openScanStaff}
                onClose={() => setOpenScanStaff(false)}
                eventId={event.id}
                onSuccess={() => {
                    setOpenScanStaff(false);
                    onRefresh();
                }}
            />
        </div>
    );
}

/* ================= COMPONENTS ================= */

function Kpi({ title, value }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border p-6">
            <div className="text-xs uppercase text-slate-400 mb-2">
                {title}
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {value}
            </div>
        </div>
    );
}

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

function SectionTitle({ children }) {
    return (
        <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-slate-900 mb-6">
            {children}
        </h2>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                {label}
            </div>
            <div className="font-medium capitalize text-slate-800">
                {value || "-"}
            </div>
        </div>
    );
}
