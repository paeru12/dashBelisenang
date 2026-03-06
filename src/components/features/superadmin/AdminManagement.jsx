"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { getEventAdmins, deleteEventAdmin } from '@/services/superadminApi';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AddEventAdminDialog } from '@/components/superadmin/AddEventAdminDialog';
import { EditEventAdminDialog } from '@/components/superadmin/EditEventAdminDialog';
import { toast } from 'sonner';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, [page, search]);

    async function fetchAdmins() {
        setLoading(true);
        try {
            const response = await getEventAdmins(page, 10, search);
            setAdmins(response.data);
        } catch (error) {
            console.error('Failed to fetch event admins:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        const ok = window.confirm('Confirm delete\n\nAre you sure you want to delete this admin?');
        if (ok) {
            try {
                await deleteEventAdmin(id);
                setAdmins(admins.filter(admin => admin.id !== id));
                toast.success('Event Admin berhasil dihapus', 'success');
            } catch (error) {
                console.error('Failed to delete admin:', error);
                toast.error('Gagal menghapus Event Admin', 'error');
            }
        }
    }

    function handleEdit(admin) {
        setSelectedAdmin(admin);
        setEditDialogOpen(true);
    }

    const columns = [
        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'totalEvents', label: 'Events' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'action',
            label: 'Action',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Event Admins"
                description="Manage event administrators"
                action={
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Admin
                    </Button>
                }
            />

            <input
                type="text"
                placeholder="Search admins..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none max-w-sm"
            />

            {loading ? (
                <LoadingSpinner />
            ) : (
                <DataTable columns={columns} data={admins} loading={false} />
            )}

            <AddEventAdminDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => {
                    fetchAdmins();
                }}
            />

            <EditEventAdminDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                admin={selectedAdmin}
                onSuccess={() => {
                    fetchAdmins();
                }}
            />
        </div>
    );
}
