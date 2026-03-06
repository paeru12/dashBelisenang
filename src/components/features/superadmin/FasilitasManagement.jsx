"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BaseModal from "@/components/common/BaseModal";
import DragDropUpload from "@/components/common/DragDropUpload";
import DataTables from "@/components/common/DataTables";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/DropdownTable";

import { confirmAlert, successAlert, errorAlert } from "@/lib/alert";
import { getFasilitas, createFasilitas, updateFasilitas, deleteFasilitas } from "@/lib/fasilitasApi";
import { Edit, Eye, Trash2, MoreHorizontal } from "lucide-react";

const MAX_SIZE = 2 * 1024 * 1024;

export default function FasilitasManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [meta, setMeta] = useState({
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [errors, setErrors] = useState({});
  const objUrlRef = useRef(null);

  /* ============================================================
     FETCH DATA
  ============================================================ */
  useEffect(() => {
    fetchData();
  }, [page, perPage, search]);

  async function fetchData() {
    try {
      setLoading(true);

      const res = await getFasilitas({ page, perPage, search });
      const mediaBase = res.data.media;

      setData(
        res.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          author: item.author?.full_name || "-",
          image: item.icon ? `${mediaBase}${item.icon.replace(/^\/+/, "")}` : null,
          createdAt: item.created_at,
        }))
      );

      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     IMAGE VALIDATION 1:1 ratio
  ============================================================ */
  const handleImageUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      setErrors({ image: "File harus berupa gambar." });
      return;
    }

    if (file.size > MAX_SIZE) {
      setErrors({ image: "Max 2MB" });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    objUrlRef.current = url;

    img.onload = () => {
      if (img.width !== img.height) {
        setErrors({ image: "Rasio gambar harus 1:1 (square)." });
        URL.revokeObjectURL(url);
        return;
      }

      setErrors({});
      setImgFile(file);
      setImgPreview(url);
    };

    img.src = url;
  };

  /* ============================================================
     ADD / EDIT
  ============================================================ */
  const handleAdd = () => {
    setEditingId(null);
    setName("");
    setImgFile(null);
    setImgPreview("");
    setErrors({});
    setOpenForm(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setName(row.name);
    setImgPreview(row.image);
    setErrors({});
    setOpenForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setImgFile(null);
    setImgPreview("");
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!editingId && !imgFile) newErrors.image = "Icon wajib diupload 1:1";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const form = new FormData();
    form.append("name", name);
    if (imgFile) form.append("icon", imgFile);

    try {
      if (editingId) {
        await updateFasilitas(editingId, form);
        await successAlert("Berhasil", "Fasilitas diperbarui");
      } else {
        await createFasilitas(form);
        await successAlert("Berhasil", "Fasilitas ditambahkan");
      }

      setOpenForm(false);
      resetForm();
      fetchData();
    } catch (err) {
        console.log(err.response)
      errorAlert("Gagal", err.response?.data?.message || err.message);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */
  const handleDelete = async (row) => {
    const res = await confirmAlert({
      title: "Hapus Fasilitas?",
      text: `Fasilitas "${row.name}" akan dihapus permanen.`,
      confirmText: "Hapus",
    });

    if (!res.isConfirmed) return;

    await deleteFasilitas(row.id);
    await successAlert("Berhasil", "Fasilitas telah dihapus.");
    fetchData();
  };

  /* ============================================================
     TABLE COLUMNS
  ============================================================ */
  const columns = [
    { key: "image", label: "Icon", type: "image" },
    { key: "name", label: "Name" },
    { key: "author", label: "Author" },
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
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="h-4 w-4" /> Delete
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
        title="Fasilitas Management"
        description="Kelola fasilitas yang tersedia"
        showNumber={true}
        columns={columns}
        data={data}
        loading={loading}
        meta={meta}
        onSearch={(v) => setSearch(v)}
        onPageChange={(v) => setPage(v)}
        onPerPageChange={(v) => setPerPage(v)}
        rightAction={<Button onClick={handleAdd}>+ Add Fasilitas</Button>}
      />

      {/* ================= FORM POPUP ================= */}
      <BaseModal open={openForm} onClose={() => setOpenForm(false)} maxWidth="max-w-lg" title={editingId ? "Edit Fasilitas" : "Tambah Fasilitas"}>
        <form onSubmit={handleSubmit} className="p-2 space-y-6">

          <DragDropUpload
            title="Icon * (1:1)"
            preview={imgPreview}
            aspect="aspect-square"
            hint="1:1 ratio, max 2MB"
            onUpload={handleImageUpload}
            onRemove={() => {
              setImgFile(null);
              setImgPreview("");
            }}
            error={errors.image}
          />

          <Input
            placeholder="Nama fasilitas"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setOpenForm(false)}>
              Cancel
            </Button>

            <Button type="submit">
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </BaseModal>

    </>
  );
}