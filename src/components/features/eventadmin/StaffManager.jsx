"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";

import {
  getPromotorPagination,
  createEventAdmin,
  createScanStaff,
  deletePromotorMember,
  updatePromotorMember,
} from "@/lib/promotorsApi";

import BaseModal from "@/components/common/BaseModal";
import DataTables from "@/components/common/DataTables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Trash, MoreHorizontal } from "lucide-react";

import {
  successAlert,
  errorAlert,
  confirmAlert,
} from "@/lib/alert";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/DropdownTable";

export default function StaffManager() {
  /* ===============================
      STATE PAGINATION & SEARCH
  =============================== */
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const { data: res, mutate } = useSWR(
    ["/promotors", page, perPage, search],
    () => getPromotorPagination({ page, perPage, search })
  );
  // FIX STRUCTURE
  const raw = res?.data?.data;

  const data = raw?.data || []; // array of admins
  const pagination = raw?.pagination || {};

  const meta = {
    page: Number(pagination.page || 1),
    perPage: Number(pagination.limit || perPage),
    totalPages: Math.ceil(
      Number(pagination.total || 0) / Number(pagination.limit || perPage)
    ),
    totalItems: Number(pagination.total || 0),
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "PROMOTOR_EVENT_ADMIN",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roleBadge = {
    PROMOTOR_OWNER:
      "bg-green-100 text-green-700 border border-green-200",
    PROMOTOR_EVENT_ADMIN:
      "bg-blue-100 text-blue-700 border border-blue-200",
    SCAN_STAFF:
      "bg-amber-100 text-amber-700 border border-amber-200",
  };

  const RoleBadge = ({ role }) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${roleBadge[role] ||
        "bg-slate-100 text-slate-600 border border-slate-200"
        }`}
    >
      {role}
    </span>
  );

  const validateForm = () => {
    const newErrors = {};

    if (!form.full_name) newErrors.full_name = "Nama wajib diisi";
    if (!form.email) newErrors.email = "Email wajib diisi";
    if (!form.password) newErrors.password = "Password wajib diisi";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Format email salah";
    if (form.password.length < 6)
      newErrors.password = "Minimal 6 karakter";
    if (form.password !== form.confirm_password)
      newErrors.confirm_password = "Password tidak sama";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ===============================
      CREATE ADMIN
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      confirm_password: form.confirm_password,
    };

    try {
      setSubmitting(true);

      if (form.type === "PROMOTOR_EVENT_ADMIN") {
        await createEventAdmin(payload);
      } else {
        await createScanStaff(payload);
      }

      await successAlert("Berhasil", "Administrator ditambahkan");
      mutate();
      setOpen(false);
    } catch (err) {
      errorAlert(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===============================
      DELETE ADMIN
  =============================== */
  const handleDelete = async (row) => {
    const confirm = await confirmAlert({
      title: "Hapus Administrator?",
      text: `Admin "${row.full_name}" akan dihapus permanen`,
    });

    if (!confirm.isConfirmed) return;

    try {
      await deletePromotorMember(row.id);
      successAlert("Berhasil", "Administrator dihapus");
      mutate();
    } catch (err) {
      errorAlert("Gagal menghapus");
    }
  };

  /* ===============================
    TOGGLE ACTIVE
  =============================== */
  const handleToggleActive = async (row) => {
    const confirm = await confirmAlert({
      title: "Ubah Status?",
      text: row.is_active
        ? "Admin akan dinonaktifkan"
        : "Admin akan diaktifkan",
    });

    if (!confirm.isConfirmed) return;

    try {
      await updatePromotorMember(row.id, {
        is_active: !row.is_active,
      });

      successAlert("Berhasil", "Status diperbarui");
      mutate();
    } catch (err) {
      errorAlert("Gagal mengubah status");
    }
  };

  /* ===============================
              RETURN UI
  =============================== */
  return (
    <div>
      <DataTables
        title="Administrator Management"
        description="Manage admin user access & permissions"
        data={data}
        loading={!res}
        meta={meta}
        showNumber={true}
        onSearch={(v) => setSearch(v)}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(v) => setPerPage(v)}
        rightAction={
          <Button size="md" onClick={() => setOpen(true)}>+ Add Admin</Button>
        }
        columns={[
          { key: "image", label: "Image", type: "image" },
          {
            key: "full_name",
            label: "Name",
          },
          {
            key: "email",
            label: "Email",
          },
          {
            key: "phone",
            label: "No Telp",
          },
          {
            key: "role",
            label: "Role",
            render: (row) => <RoleBadge role={row.role} />,
          },
          {
            key: "is_active",
            label: "Status",
            render: (row) => {
              const isSuper = row.role === "PROMOTOR_OWNER";

              return (
                <button
                  disabled={isSuper}
                  onClick={() => !isSuper && handleToggleActive(row)}
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    ${row.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
                    ${isSuper ? " cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {row.is_active ? "Active" : "Inactive"}
                </button>
              );
            },
          },
          {
            key: "action",
            label: "Action",
            render: (row) => {
               if (row.role === "PROMOTOR_OWNER") {
                return (
                  <span className="text-slate-400 text-xs italic">
                    Protected
                  </span>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleDelete(row)}
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
      />

      {/* ===========================
           Modal Add Admin
      =========================== */}
      <BaseModal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Administrator"
        maxWidth="max-w-xl "
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="PROMOTOR_EVENT_ADMIN">
              Event Admin
            </option>
            <option value="SCAN_STAFF">
              Scan Staff
            </option>
          </select>

          <Input
            placeholder="Nama Lengkap"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />
          {errors.full_name && (
            <p className="text-xs text-red-500">{errors.full_name}</p>
          )}

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}

          <Input
            placeholder="No Telepon"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          {/* PASSWORD */}
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}

          <Input
            type="password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
          />
          {errors.confirm_password && (
            <p className="text-xs text-red-500">{errors.confirm_password}</p>
          )}

          <div className="grid md:justify-end pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
