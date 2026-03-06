"use client";

import React, { useEffect, useState } from "react";
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

import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from "@/lib/bannerApi";

import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { confirmAlert, successAlert, errorAlert } from "@/lib/alert";

const MAX_SIZE = 2 * 1024 * 1024;

export default function BannerManagement() {
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

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [page, perPage, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getBanners({ page, perPage, search });

      const mediaBase = res.data.media;

      setData(
        res.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          link: item.link || "-",
          isActive: item.is_active ? "Active" : "Inactive",
          author: item.author?.full_name,
          image: item.image_banner
            ? `${mediaBase}${item.image_banner.replace(/^\/+/, "")}`
            : "",
        }))
      );

      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setName("");
    setLink("");
    setIsActive("true");
    setImgFile(null);
    setImgPreview("");
    setErrors({});
    setOpen(true);
  };

  const handleImageUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      setErrors({ image: "Harus gambar." });
      return;
    }

    if (file.size > MAX_SIZE) {
      setErrors({ image: "Max 2MB" });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const ratio = img.width / img.height;

      if (Math.abs(ratio - 2) > 0.05) {
        setErrors({ image: "Rasio harus 2:1" });
        URL.revokeObjectURL(url);
        return;
      }

      setErrors({});
      setImgFile(file);
      setImgPreview(url);
    };

    img.src = url;
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setName(row.name);
    setLink(row.link === "-" ? "" : row.link);
    setIsActive(row.isActive === "Active" ? "true" : "false");
    setImgPreview(row.image);
    setImgFile(null);

    setOpen(true);
  };

  const handleDelete = async (row) => {
    const res = await confirmAlert({
      title: "Hapus Banner?",
      text: `Banner "${row.name}" akan dihapus permanen.`,
      confirmText: "Hapus",
    });

    if (!res.isConfirmed) return;

    await deleteBanner(row.id);
    await successAlert("Berhasil", "Banner dihapus.");
    fetchData();
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const nErr = {};
    if (!name.trim()) nErr.name = "Nama wajib.";
    if (!editingId && !imgFile) nErr.image = "Gambar wajib.";

    if (Object.keys(nErr).length) {
      setErrors(nErr);
      return;
    }

    const form = new FormData();
    form.append("name", name);
    form.append("link", link);
    form.append("is_active", isActive === "true");
    if (imgFile) form.append("image_banner", imgFile);

    try {
      if (editingId) {
        await updateBanner(editingId, form);
        await successAlert("Berhasil", "Banner diperbarui.");
      } else {
        await createBanner(form);
        await successAlert("Berhasil", "Banner ditambahkan.");
      }

      setOpen(false);
      fetchData();
    } catch (err) {
      errorAlert("Gagal", err.response?.data?.message || err.message);
    }
  }

  const columns = [
    { key: "image", label: "Image", type: "image" },
    { key: "name", label: "Name" },
    { key: "link", label: "Link" },
    { key: "isActive", label: "Status", type: "badge" },
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
              <Edit size={16} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row)}
            >
              <Trash2 size={16} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTables
        title="Banner Management"
        description="Kelola banner promosi yang tampil pada halaman utama"
        columns={columns}
        data={data}
        loading={loading}
        meta={meta}
        onSearch={(v) => setSearch(v)}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(v) => setPerPage(v)}
        rightAction={<Button onClick={handleAdd}>+ Add Banner</Button>}
      />

      <BaseModal open={open} onClose={() => setOpen(false)} maxWidth="max-w-2xl" title={editingId ? "Edit Banner" : "Tambah Banner"}>
        {/* <div className="p-6 space-y-6 overflow-auto"> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <DragDropUpload
            title="Banner 2:1"
            preview={imgPreview}
            aspect="aspect-[2/1]"
            hint="Wajib rasio 2:1, max 2MB"
            onUpload={handleImageUpload}
            onRemove={() => {
              setImgFile(null);
              setImgPreview("");
            }}
            error={errors.image}
          />

          <Input placeholder="Nama banner" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

          <Input placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} />

          {editingId && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {isActive === "true" ? "Active" : "Inactive"}
              </span>

              <button
                type="button"
                onClick={() => setIsActive(isActive === "true" ? "false" : "true")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isActive === "true" ? "bg-blue-500" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isActive === "true" ? "translate-x-5" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          )}

          <div className="grid md:justify-end gap-3 pt-4">
            <Button type="submit">{editingId ? "Update" : "Save"}</Button>
          </div>
        </form>
        {/* </div> */}
      </BaseModal>
    </>
  );
}
