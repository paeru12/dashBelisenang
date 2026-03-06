"use client";

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';

export default function EventAdminDashboard() {
    const totalEvents = 8;
    const totalTicketsSold = 1243;
    const totalRevenue = 98765000; // in cents or local currency

    const recentOrders = [
        { code: 'ORD-1001', customer: 'Aisyah', total: 'Rp 150.000', status: 'paid', date: '2025-12-10' },
        { code: 'ORD-1002', customer: 'Budi', total: 'Rp 50.000', status: 'paid', date: '2025-12-11' },
        { code: 'ORD-1003', customer: 'Citra', total: 'Rp 200.000', status: 'pending', date: '2025-12-11' },
        { code: 'ORD-1004', customer: 'Deni', total: 'Rp 75.000', status: 'paid', date: '2025-12-12' },
        { code: 'ORD-1005', customer: 'Eka', total: 'Rp 125.000', status: 'cancelled', date: '2025-12-13' },
    ];

    const columns = [
        { key: 'code', label: 'Kode Order' },
        { key: 'customer', label: 'Nama' },
        { key: 'total', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Tanggal' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-sm text-muted-foreground">Total Events</div>
                    <div className="text-2xl font-bold">{totalEvents}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-sm text-muted-foreground">Total Tiket Terjual</div>
                    <div className="text-2xl font-bold">{totalTicketsSold}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold">Rp {Intl.NumberFormat('id-ID').format(totalRevenue)}</div>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Button size="sm">View all</Button>
            </div>
            <DataTable columns={columns} data={recentOrders} />
        </div>
    );
}
