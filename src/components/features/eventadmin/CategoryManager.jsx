"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { TagInput } from "@/components/ui/tagsinput";
import BaseModal from "@/components/common/BaseModal";
import DragDropUpload from "@/components/common/DragDropUpload";
import RichTextEditor from "@/components/common/RichTextEditor";
import DataTables from "@/components/common/DataTables";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/lib/categoryApi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/common/DropdownTable";
import { confirmAlert, successAlert, errorAlert } from "@/lib/alert";
import { renderHtml } from "@/utils/text";
const MAX_SIZE = 2 * 1024 * 1024;
export default function CategoryManager() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [meta, setMeta] = useState({
        page: 1,
        perPage: 10,
        totalPages: 1,
        totalItems: 0,
    });
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState("");
    const [errors, setErrors] = useState({});
    const objectUrlRef = useRef(null);
    useEffect(() => {
        fetchCategories();
    }, [page, perPage, search]);
    async function fetchCategories() {
        try {
            setLoading(true);
            const res = await getCategories({
                page,
                perPage,
                search,
            });
            const mediaBase = res.data.media;
            setData(
                res.data.data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    users: item.users?.full_name,
                    description: renderHtml(item.description),
                    keywords: item.keywords,
                    image: item.image
                        ? `${mediaBase}${item.image.replace(/^\/+/, "")}`
                        : "",
                }))
            );
            setMeta(res.data.meta);
        } finally {
            setLoading(false);
        }
    }
    const handleAdd = () => {
        setEditingId(null);
        setName("");
        setDesc("");
        setKeywords([]);
        setImgFile(null);
        setImgPreview("");
        setErrors({});
        setOpenForm(true);
    };

    const handleImageUpload = (file) => {
        if (!file.type.startsWith("image/")) {
            setErrors({ image: "File harus berupa gambar." });
            return;
        }

        if (file.size > MAX_SIZE) {
            setErrors({ image: "Ukuran maksimal 2MB." });
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;

        img.onload = () => {
            if (img.width !== img.height) {
                setErrors({ image: "Gambar harus perbandingan 1:1." });
                URL.revokeObjectURL(objectUrl);
                return;
            }

            setErrors({});
            setImgPreview(objectUrl);
            setImgFile(file);
        };

        img.src = objectUrl;
    };

    const handleEdit = (row) => {
        setEditingId(row.id);
        setName(row.name);
        setDesc(row.description);
        setKeywords(
            row.keywords ? row.keywords.split(",").map(k => k.trim()) : []
        );
        setImgPreview(row.image);
        setOpenForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setDesc("");
        setKeywords([]);
        setImgFile(null);
        setImgPreview("");
        setErrors({});
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Nama wajib diisi";
        if (!desc.trim()) newErrors.desc = "Deskripsi wajib diisi";
        if (!keywords.length)
            newErrors.keywords = "Keywords wajib diisi";
        if (!editingId && !imgFile)
            newErrors.image = "Gambar wajib diisi";

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", desc);
        formData.append("keywords", keywords.join(","));
        if (imgFile) formData.append("image", imgFile);

        try {
            if (editingId) {
                await updateCategory(editingId, formData);
                await successAlert("Berhasil", "Kategori diperbarui");
            } else {
                await createCategory(formData);
                await successAlert("Berhasil", "Kategori ditambahkan");
            }

            setOpenForm(false);
            resetForm();
            fetchCategories();
        } catch (err) {
            errorAlert("Gagal", err.response?.data?.message || err.message);
        }
    }

    async function handleDelete(row) {
        const res = await confirmAlert({
            title: "Hapus kategori?",
            text: `Kategori "${row.name}" akan dihapus permanen.`,
            confirmText: "Ya, Hapus",
        });

        if (!res.isConfirmed) return;

        await deleteCategory(row.id);
        await successAlert("Berhasil", "Kategori dihapus");
        fetchCategories();
    }

    const handleDetail = (row) => {
        setSelected(row);
        setOpenDetail(true);
    };

    return (
        <>
            <DataTables
                title="Category Management"
                description="Manage category data and content"
                showNumber={true}
                columns={[
                    { key: "image", label: "Image", type: "image" },
                    { key: "name", label: "Name" },
                    { key: "users", label: "Author" },
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
                                    <DropdownMenuItem onClick={() => handleDetail(row)}>
                                        <Eye className="h-4 w-4" /> View Detail
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => handleEdit(row)}>
                                        <Edit className="h-4 w-4" /> Edit
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => handleDelete(row)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ),
                    },
                ]}
                data={data}
                loading={loading}
                meta={meta}
                onSearch={(v) => setSearch(v)}
                onPageChange={(p) => setPage(p)}
                onPerPageChange={(val) => setPerPage(val)}
                rightAction={<Button onClick={handleAdd}>+ Add Category</Button>}
            />


            <BaseModal open={openForm} onClose={() => setOpenForm(false)}>
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-4 gap-6">
                    <h5 className="col-span-4 text-lg font-semibold">
                        {editingId ? "Edit Kategori" : "Tambah Kategori"}
                    </h5>

                    <div className="col-span-1">
                        <DragDropUpload
                            title="Icon Kategori"
                            preview={imgPreview}
                            aspect="aspect-square"
                            hint="1:1 max 2MB"
                            onUpload={handleImageUpload}
                            onRemove={() => {
                                setImgPreview("");
                                setImgFile(null);
                            }}
                            error={errors.image}
                        />
                    </div>

                    <div className="col-span-3 space-y-4">
                        <Input
                            placeholder="Nama kategori"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <RichTextEditor value={desc} onChange={setDesc} />
                        <TagInput
                            keywords={keywords}
                            setKeywords={setKeywords}
                            maxKeywords={20}
                            error={errors.keywords}
                        />
                        {errors.keywords && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.keywords}
                            </p>
                        )}

                        <Button type="submit">
                            {editingId ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </form>
            </BaseModal>

            <BaseModal open={openDetail} onClose={() => setOpenDetail(false)}>
                {selected && (
                    <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto shadow-xl space-y-6">

                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Detail Kategori</h2>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(selected.image)}
                            >
                                Copy Link
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <img
                                    src={selected.image}
                                    className="w-full rounded-xl border object-cover"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">Nama Kategori</p>
                                    <p className="text-lg font-semibold">{selected.name}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Deskripsi</p>
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selected.description }}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.keywords?.split(",").map((k, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                                            >
                                                {k.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </BaseModal>

        </>
    );
}
