"use client";

import { useState, useEffect } from "react";
import BaseModal from "@/components/common/BaseModal";
import { Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import "react-day-picker/dist/style.css";

// Detect Mobile Screen Size
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () =>
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);

        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile;
}

export default function DateFilterModal({ open, onClose, onApply }) {
    const isMobile = useIsMobile();

    const [range, setRange] = useState({ from: undefined, to: undefined });
    const [accordionOpen, setAccordionOpen] = useState(false);

    const presets = [
        { label: "Today", icon: <CalendarIcon className="w-4 h-4" />, range: { from: new Date(), to: new Date() } },
        { label: "Yesterday", icon: <Clock className="w-4 h-4" />, range: { from: addDays(new Date(), -1), to: addDays(new Date(), -1) } },
        { label: "Last 7 Days", icon: <CalendarIcon className="w-4 h-4" />, range: { from: addDays(new Date(), -7), to: new Date() } },
        { label: "Last 30 Days", icon: <CalendarIcon className="w-4 h-4" />, range: { from: addDays(new Date(), -30), to: new Date() } },
        { label: "This Month", icon: <CalendarIcon className="w-4 h-4" />, range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
        { label: "Last Month", icon: <CalendarIcon className="w-4 h-4" />, range: { from: startOfMonth(addDays(new Date(), -30)), to: endOfMonth(addDays(new Date(), -30)) } }
    ];

    function reset() {
        setRange({ from: undefined, to: undefined });
    }

    function clearFilter() {
        // kosongkan tanggal
        setRange({ from: undefined, to: undefined });

        // kirim ke parent (supaya filter langsung hilang)
        onApply({
            startDate: null,
            endDate: null
        });

        // tutup modal langsung (tanpa harus klik Apply)
        onClose();
    }

    function handleSelect(selected) {
        // Selected bisa null saat clear
        if (!selected) {
            setRange({ from: undefined, to: undefined });
            return;
        }

        // Jika user klik tanggal sama dua kali → jadikan single-day range
        if (selected.from && !selected.to) {
            setRange({
                from: selected.from,
                to: selected.from
            });
            return;
        }

        setRange(selected);
    }

    function apply() {
        if (!range.from || !range.to) return;

        onApply({
            startDate: range.from,
            endDate: range.to
        });

        onClose();
    }

    const defaultMonth = isMobile
        ? new Date()
        : addDays(startOfMonth(new Date()), -1);

    return (
        <BaseModal open={open} onClose={onClose} title="Filter Date" maxWidth="max-w-5xl">
            <div className="flex flex-col md:flex-row gap-6">

                {/* ===================== MOBILE ACCORDION ===================== */}
                {isMobile && (
                    <div className="w-full">
                        <button
                            className="w-full flex justify-between items-center px-4 py-3 border rounded-lg bg-white shadow-sm"
                            onClick={() => setAccordionOpen(!accordionOpen)}
                        >
                            <span className="font-medium">Quick Selection</span>
                            <motion.div
                                animate={{ rotate: accordionOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {accordionOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden mt-2"
                                >
                                    <div className="border rounded-xl bg-white shadow p-3 space-y-1">
                                        {presets.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setRange(p.range);
                                                    setAccordionOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                          hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition"
                                            >
                                                <span className="text-blue-600">{p.icon}</span>
                                                {p.label}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => {
                                                clearFilter();
                                                setAccordionOpen(false);
                                            }}
                                            className="w-full px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg mt-2"
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* ===================== DESKTOP SIDEBAR ===================== */}
                {!isMobile && (
                    <div className="w-full md:w-1/4 border-r pr-4">
                        <h3 className="text-lg font-semibold mb-4">Quick Selection</h3>

                        <div className="space-y-1">
                            {presets.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setRange(p.range)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition text-[15px]"
                                >
                                    <span className="text-blue-600">{p.icon}</span>
                                    {p.label}
                                </button>
                            ))}

                            <button
                                onClick={clearFilter}
                                className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg mt-4"
                            >
                                Clear Filter
                            </button>
                        </div>
                    </div>
                )}

                {/* ===================== CALENDAR ===================== */}
                <div className="flex-1 flex flex-col items-center">

                    {/* Breadcrumb */}
                    {range?.from && range?.to && (
                        <div className="text-blue-600 font-medium mb-3 text-sm">
                            From <b>{range.from.toDateString()}</b> → To <b>{range.to.toDateString()}</b>
                        </div>
                    )}

                    <div className="border rounded-2xl shadow bg-white p-4 md:p-6 w-full flex justify-center">
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={handleSelect}
                            numberOfMonths={isMobile ? 1 : 2}
                            defaultMonth={defaultMonth}
                            fixedWeeks
                            pagedNavigation
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6 w-full">
                        <button className="px-4 py-2 border rounded-lg hover:bg-gray-100" onClick={onClose}>Cancel</button>
                        <button className="px-4 py-2 border rounded-lg hover:bg-gray-100" onClick={reset}>Reset</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={apply}>Apply</button>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
        .rdp-day_selected {
          background: #2563eb !important;
          color: white !important;
        }
        .rdp-range_start,
        .rdp-range_end,
        .rdp-range_middle {
          background: #dbeafe !important;
        }
        .rdp-day:hover {
          background: linear-gradient(135deg, #e5e7eb, #f8fafc) !important;
          border-radius: 8px;
        }
      `}</style>
        </BaseModal>
    );
}