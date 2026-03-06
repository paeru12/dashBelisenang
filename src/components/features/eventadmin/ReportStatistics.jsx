"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initial = Array.from({ length: 12 }).map((_, i) => ({
    date: `2025-12-${(i % 28) + 1}`,
    orders: Math.floor(Math.random() * 30),
    tickets: Math.floor(Math.random() * 200),
    revenue: (Math.floor(Math.random() * 100) + 10) * 1000,
}));

export default function ReportStatistics() {
    const [data] = useState(initial);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const columns = [
        { key: 'date', label: 'Tanggal' },
        { key: 'orders', label: 'Jumlah Order' },
        { key: 'tickets', label: 'Tiket Terjual' },
        { key: 'revenue', label: 'Revenue', render: (r) => `Rp ${Intl.NumberFormat('id-ID').format(r.revenue)}` },
    ];

    const filtered = data.filter((d) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || [d.date, d.orders.toString(), d.tickets.toString(), `Rp ${Intl.NumberFormat('id-ID').format(d.revenue)}`].join(' ').toLowerCase().includes(q);
        return matchesSearch;
    });

    const sorted = React.useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sortKey];
            const vb = b[sortKey];
            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDir === 'asc' ? va - vb : vb - va;
            }
            const sa = String(va || '').toLowerCase();
            const sb = String(vb || '').toLowerCase();
            if (sa < sb) return sortDir === 'asc' ? -1 : 1;
            if (sa > sb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const pageData = sorted.slice((page - 1) * perPage, page * perPage);

    function toggleSort(key) {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir('asc');
            return;
        }
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }

    function exportCsv() {
        const csv = ['Tanggal,Jumlah Order,Tiket Terjual,Revenue', ...data.map(d => `${d.date},${d.orders},${d.tickets},${d.revenue}`)].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'report.csv'; a.click(); URL.revokeObjectURL(url);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
                <div className="flex gap-2">
                    <Button onClick={exportCsv} variant="outline" className="text-slate-900 border-slate-200">Export CSV</Button>
                    <Button variant="outline" className="text-slate-900 border-slate-200">Export Excel</Button>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 text-slate-700">Sales (dummy chart)</h3>
                <div className="h-40 bg-white shadow-sm border border-slate-100 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        {data.slice(0, 10).map((d, i) => (
                            <rect key={i} x={i * 9} y={30 - (d.tickets / 10)} width="6" height={(d.tickets / 10)} fill="#3b82f6" rx="1" />
                        ))}
                    </svg>
                </div>
            </div>

            <div className="rounded-lg bg-white shadow-sm p-4 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Input
                            placeholder="Search reports..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="h-10 text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                        <select
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                            className="border rounded px-2 py-1 text-sm bg-white text-slate-900 focus:outline-none"
                            aria-label="Rows per page"
                        >
                            <option value={6}>6 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm divide-y">
                        <thead>
                            <tr className="text-left text-xs text-slate-500">
                                {columns.map((c) => (
                                    <th key={c.key} className="px-3 py-2">
                                        <button
                                            className="inline-flex items-center gap-2 text-left w-full hover:text-slate-900 transition-colors"
                                            onClick={() => toggleSort(c.key)}
                                            aria-label={`Sort by ${c.label}`}
                                        >
                                            <span className="whitespace-nowrap">{c.label}</span>
                                            <span className="ml-1">
                                                {sortKey === c.key ? (
                                                    sortDir === 'asc' ? (
                                                        <svg className="w-3 h-3 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                            <path d="M5 12l5-5 5 5H5z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                            <path d="M15 8l-5 5-5-5h10z" />
                                                        </svg>
                                                    )
                                                ) : (
                                                    <svg className="w-3 h-3 text-slate-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                        <path d="M5 12l5-5 5 5H5z" />
                                                    </svg>
                                                )}
                                            </span>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-500">No reports found.</td>
                                </tr>
                            ) : (
                                pageData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-3 py-3">
                                                {column.render ? column.render(row) : row[column.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                    <div className="text-sm text-slate-500">
                        Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, sorted.length)} of {sorted.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded hover:bg-slate-100 focus:outline-none disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            aria-label="Previous page"
                        >
                            <svg className="w-4 h-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M12.293 16.293L7.586 11.586 12.293 6.879 11.293 5.879 5.879 11.293 11.293 16.707z" />
                            </svg>
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`px-3 py-1 rounded text-sm font-medium ${page === i + 1 ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            className="p-2 rounded hover:bg-slate-100 focus:outline-none disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            aria-label="Next page"
                        >
                            <svg className="w-4 h-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 3.707L12.414 8.414 7.707 13.121 8.707 14.121 14.121 8.707 8.707 3.293z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
