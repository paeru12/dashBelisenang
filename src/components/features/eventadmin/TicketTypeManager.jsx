"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const initial = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: `Regular ${i + 1}`,
    price: 50000 + i * 5000,
    quota: 100 + i * 10,
    sold: Math.floor(Math.random() * 50),
    maxOrder: 4,
    status: i % 2 === 0 ? 'active' : 'inactive',
}));

export default function TicketTypeManager() {
    const [data, setData] = useState(initial);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', price: '', quota: '', maxOrder: '', period: '' });

    const columns = [
        { key: 'name', label: 'Nama Tiket' },
        { key: 'price', label: 'Harga', render: (r) => `Rp ${Intl.NumberFormat('id-ID').format(r.price)}` },
        { key: 'quota', label: 'Kuota Total' },
        { key: 'sold', label: 'Terjual' },
        { key: 'maxOrder', label: 'Max Order' },
        { key: 'status', label: 'Status' },
    ];

    const filtered = data.filter((d) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || [d.name, `Rp ${Intl.NumberFormat('id-ID').format(d.price)}`, d.quota.toString(), d.sold.toString(), d.maxOrder.toString()].join(' ').toLowerCase().includes(q);
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

    function handleAdd(e) {
        e.preventDefault();
        const item = { id: data.length + 1, name: form.name, price: Number(form.price), quota: Number(form.quota), sold: 0, maxOrder: Number(form.maxOrder), status: 'active' };
        setData([item, ...data]);
        setOpen(false);
        setForm({ name: '', price: '', quota: '', maxOrder: '', period: '' });
        setPage(1);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Ticket Types</h2>
                <Button onClick={() => setOpen(true)}>+ Add Ticket Type</Button>
            </div>

            <div className="rounded-lg bg-white shadow-sm p-4 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Input
                            placeholder="Search ticket types..."
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
                                    <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-500">No ticket types found.</td>
                                </tr>
                            ) : (
                                pageData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-3 py-3 font-medium">{row.name}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{`Rp ${Intl.NumberFormat('id-ID').format(row.price)}`}</td>
                                        <td className="px-3 py-3">{row.quota}</td>
                                        <td className="px-3 py-3">{row.sold}</td>
                                        <td className="px-3 py-3">{row.maxOrder}</td>
                                        <td className="px-3 py-3">
                                            {row.status === 'active' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                                            )}
                                        </td>
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

                        <div className="hidden sm:flex items-center gap-1 text-slate-900">
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Ticket Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Nama Tiket</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Harga</label>
                            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Kuota</label>
                            <Input value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })} className="text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Max Order</label>
                            <Input value={form.maxOrder} onChange={(e) => setForm({ ...form, maxOrder: e.target.value })} className="text-slate-900" />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
