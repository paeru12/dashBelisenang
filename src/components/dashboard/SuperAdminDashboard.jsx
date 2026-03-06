"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Users, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/superadmin/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { getDashboardStats, getLatestEvents } from '@/services/superadminApi';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatCurrency(value) {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `Rp ${(value / 1000).toFixed(1)}K`;
    }
    return `Rp ${value}`;
}

function formatNumber(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return String(value);
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, eventsData] = await Promise.all([
                    getDashboardStats(),
                    getLatestEvents(5),
                ]);
                setStats(statsData);
                setEvents(eventsData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Dashboard"
                description="Overview of your e-ticketing platform"
            />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Events"
                    value={stats?.totalEvents ?? 0}
                    icon={<Calendar className="h-6 w-6" />}
                    variant="events"
                />
                <StatCard
                    title="Event Admins"
                    value={stats?.totalEventAdmins ?? 0}
                    icon={<Users className="h-6 w-6" />}
                    variant="admins"
                />
                <StatCard
                    title="Total Orders"
                    value={formatNumber(stats?.totalOrders ?? 0)}
                    icon={<ShoppingCart className="h-6 w-6" />}
                    variant="orders"
                    growth={stats?.ordersGrowth}
                    growthLabel="vs last month"
                />
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue ?? 0)}
                    icon={<DollarSign className="h-6 w-6" />}
                    variant="revenue"
                    growth={stats?.revenueGrowth}
                    growthLabel="vs last month"
                />
            </div>

            {/* Latest Events */}
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold">Latest Events</h2>
                        <p className="text-sm text-muted-foreground">Recent events on your platform</p>
                    </div>
                    <Link href="/events">
                        <Button variant="outline" size="sm" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                            <div className="flex-1">
                                <p className="font-medium">{event.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{event.soldTickets}/{event.totalTickets}</p>
                                <StatusBadge status={event.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
