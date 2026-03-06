"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  getPromotorMembers,
  createEventAdmin,
  createScanStaff,
  deletePromotorMember,
  updatePromotorMember,
} from "@/lib/promotorsApi";

import { Eye, EyeOff, Trash } from "lucide-react";
import BaseModal from "@/components/common/BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  successAlert,
  errorAlert,
  confirmAlert,
} from "@/lib/alert";

export default function StaffManager() {
  const { data, mutate } = useSWR(
    "/promotors",
    getPromotorMembers
  );

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // =========================
  // VALIDATION
  // =========================

  const validateForm = () => {
    const newErrors = {};

    if (!form.full_name) newErrors.full_name = "Nama wajib diisi";
    if (!form.email) newErrors.email = "Email wajib diisi";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Format email tidak valid";

    if (form.password.length < 6)
      newErrors.password = "Minimal 6 karakter";

    if (form.password !== form.confirm_password)
      newErrors.confirm_password = "Password tidak sama";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // PASSWORD STRENGTH
  // =========================

  const getPasswordStrength = () => {
    const p = form.password;
    if (p.length < 6) return "Weak";
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))
      return "Strong";
    return "Medium";
  };

  const strengthColor = {
    Weak: "text-red-500",
    Medium: "text-yellow-500",
    Strong: "text-green-600",
  };

  // =========================
  // CREATE ADMIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirm_password: form.confirm_password,
      };

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

  // =========================
  // OPTIMISTIC DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirm = await confirmAlert({
      title: "Hapus Administrator?",
      text: "Data tidak dapat dikembalikan",
    });

    if (!confirm.isConfirmed) return;

    // Optimistic update
    const oldData = data;
    mutate(data.filter((d) => d.id !== id), false);

    try {
      await deletePromotorMember(id);
      successAlert("Berhasil", "Administrator dihapus");
    } catch (err) {
      mutate(oldData, false); // rollback
      errorAlert("Gagal", "Gagal menghapus");
    }
  };

  // =========================
  // ACTIVE TOGGLE
  // =========================

  const handleToggleActive = async (row) => {
    const confirm = await confirmAlert({
      title: "Ubah Status Administrator?",
      text: "Administrator akan " + (row.is_active ? "dinonaktifkan" : "diaktifkan"),
    });

    if (!confirm.isConfirmed) return;
    const updated = { ...row, is_active: !row.is_active };

    mutate(
      data.map((d) => (d.id === row.id ? updated : d)),
      false
    );

    try {
      await updatePromotorMember(row.id, {
        is_active: updated.is_active,
      });
    } catch (err) {
      mutate(); // rollback full reload
      errorAlert("Gagal", "Update status gagal");
    }
  };

  // =========================
  // UI
  // =========================
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Administrator
        </h2>
        <Button onClick={() => setOpen(true)}>
          + Add Admin
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="p-4 font-medium capitalize">
                    {row.full_name}
                  </td>

                  <td className="text-slate-600">
                    {row.email}
                  </td>

                  <td>
                    <RoleBadge role={row.role} />
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleToggleActive(row)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${row.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      {row.is_active
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>

                  <td className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDelete(row.id)
                      }
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VERSION */}
        <div className="md:hidden divide-y">
          {data?.map((row) => (
            <div
              key={row.id}
              className="p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {row.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {row.email}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleDelete(row.id)
                  }
                  className="text-red-500"
                >
                  <Trash size={16} />
                </Button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <RoleBadge role={row.role} />

                <button
                  onClick={() =>
                    handleToggleActive(row)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium ${row.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                    }`}
                >
                  {row.is_active
                    ? "Active"
                    : "Inactive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* =========================
           BASE MODAL
         ========================= */}

      <BaseModal
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Add Administrator
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
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

          {/* FULL NAME */}
          <div>
            <Input
              placeholder="Nama Lengkap"
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value,
                })
              }
            />
            {errors.full_name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.full_name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <Input
              placeholder="No Telepon"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600 transition"
              >
                {showPass ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {form.password && (
              <p
                className={`text-xs mt-1 ${strengthColor[getPasswordStrength()]
                  }`}
              >
                Strength: {getPasswordStrength()}
              </p>
            )}
          </div>

          {/* CONFIRM */}
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm_password:
                    e.target.value,
                })
              }
            />
            {errors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
