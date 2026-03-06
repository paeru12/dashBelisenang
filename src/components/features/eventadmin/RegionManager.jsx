"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Edit, Trash2, MapPin } from "lucide-react";
import { confirmAlert, successAlert } from "@/lib/alert";
import { renderHtml } from "@/utils/text";

/* =========================
   API SERVICE
========================= */
import {
    getRegions,
    createRegion,
    updateRegion,
    deleteRegion,
} from "@/lib/regionApi";

export default function RegionManager() {
    /* =========================
       STATE DATA
    ========================= */
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const [search, setSearch] = useState("");

    const [meta, setMeta] = useState({
        page: 1,
        perPage: 6,
        totalItems: 0,
        totalPages: 1,
    });

    /* =========================
       STATE FORM
    ========================= */
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [keywords, setKeywords] = useState("");
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState("");
    const [errors, setErrors] = useState({});

    /* =========================
       FETCH DATA (SERVER SIDE)
    ========================= */
    useEffect(() => {
        fetchRegions();
    }, [page, perPage, search]);

    async function fetchRegions() {
        try {
            setLoading(true);

            const res = await getRegions({
                page,
                perPage,
                search,
            });

            const mediaBase = res.data.media;

            setData(
                res.data.data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: renderHtml(item.description),
                    keywords: item.keywords,
                    author: item.users?.full_name,
                    image: item.image
                        ? `${mediaBase}${item.image.replace(/^\/+/, "")}`
                        : "",
                }))
            );

            setMeta(res.data.meta);
        } catch (err) {
            console.error("Fetch regions error:", err);
        } finally {
            setLoading(false);
        }
    }

    /* =========================
       FORM HANDLER
    ========================= */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImgFile(file);
            setImgPreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (row) => {
        setEditingId(row.id);
        setName(row.name);
        setDesc(row.description);
        setKeywords(row.keywords || "");
        setImgPreview(row.image);
        setImgFile(null);
        setOpen(true);
    };

    async function handleDelete(row) {
        const res = await confirmAlert({
            title: "Hapus wilayah?",
            text: `Wilayah "${row.name}" akan dihapus permanen.`,
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
        });

        if (!res.isConfirmed) return;

        try {
            await deleteRegion(row.id);
            await successAlert("Berhasil", "Wilayah berhasil dihapus.");
            setPage(1);
            fetchRegions();
        } catch (err) {
            console.error("Delete region error:", err);
        }
    }

    const closeDialog = () => {
        setOpen(false);
        setEditingId(null);
        setName("");
        setDesc("");
        setKeywords("");
        setImgFile(null);
        setImgPreview("");
        setErrors({});
    };

    async function handleSubmit(e) {
        e.preventDefault();

        const newErrors = {};
        if (!name.trim()) newErrors.name = "Nama wilayah wajib diisi.";
        if (!desc.trim()) newErrors.desc = "Deskripsi wajib diisi.";
        if (!keywords.trim()) newErrors.keywords = "Keywords wajib diisi.";
        if (!editingId && !imgFile)
            newErrors.img = "Gambar wajib diisi.";

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", desc);
        formData.append("keywords", keywords);
        if (imgFile) formData.append("image", imgFile);

        try {
            if (editingId) {
                await updateRegion(editingId, formData);
                await successAlert("Berhasil", "Wilayah berhasil diubah.");
            } else {
                await createRegion(formData);
                await successAlert("Berhasil", "Wilayah berhasil ditambahkan.");
            }

            closeDialog();
            fetchRegions();
        } catch (err) {
            console.error("Submit region error:", err);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Wilayah</h2>
                <Button onClick={() => setOpen(true)} className="gap-2">
                    <MapPin size={16} /> Add Wilayah
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 text-slate-900">
                {/* Search & PerPage */}
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Input
                            placeholder="Search wilayah..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-10 text-slate-900"
                        />
                    </div>

                    <select
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        className="border rounded px-2 py-1 text-sm bg-white text-slate-900 focus:outline-none"
                    >
                        <option value={2}>2 / page</option>
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                    </select>
                </div>

                {/* Info */}
                <div className="text-sm text-slate-600 mb-2">
                    Showing{" "}
                    <strong>
                        {(meta.page - 1) * meta.perPage + 1}
                    </strong>{" "}
                    –{" "}
                    <strong>
                        {Math.min(meta.page * meta.perPage, meta.totalItems)}
                    </strong>{" "}
                    of <strong>{meta.totalItems}</strong>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm divide-y">
                        <thead>
                            <tr className="text-left text-xs text-slate-500">
                                <th className="px-3 py-2">No</th>
                                <th className="px-3 py-2">Gambar</th>
                                <th className="px-3 py-2">Nama</th>
                                <th className="px-3 py-2">Deskripsi</th>
                                <th className="px-3 py-2">Keywords</th>
                                <th className="px-3 py-2">Author</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6">
                                        Loading...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6">
                                        Data kosong
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-3 font-semibold">
                                            {(meta.page - 1) * meta.perPage + idx + 1}.
                                        </td>
                                        <td className="px-3 py-3">
                                            {row.image ? (
                                                <img
                                                    src={row.image}
                                                    alt={row.name}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    No Image
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 font-medium capitalize">
                                            {row.name}
                                        </td>
                                        <td
                                            className="px-3 py-3 prose prose-sm max-w-none text-slate-700"
                                            dangerouslySetInnerHTML={{ __html: row.description }}
                                        />
                                        <td className="px-3 py-3 text-slate-500">{row.keywords}</td>
                                        <td className="px-3 py-3 capitalize text-slate-600">{row.author}</td>
                                        <td className="px-3 py-3 text-right space-x-2 whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(row)}
                                                className="text-blue-600"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(row)}
                                                className="text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-end mt-4 gap-1">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={meta.page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            ‹
                        </Button>

                        {Array.from(
                            { length: meta.totalPages },
                            (_, i) => i + 1
                        ).map((p) => (
                            <Button
                                key={p}
                                size="sm"
                                variant={p === meta.page ? "default" : "outline"}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}

                        <Button
                            size="sm"
                            variant="outline"
                            disabled={meta.page === meta.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            ›
                        </Button>
                    </div>
                )}
            </div>

            {/* MODAL */}
            <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Wilayah" : "Add Wilayah"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Nama wilayah"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-slate-900"
                        />

                        <RichTextEditor value={desc} onChange={setDesc} />

                        <Input
                            placeholder="kota, provinsi, daerah"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="text-slate-900"
                        />

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">Gambar Wilayah *</label>
                            <label
                                className={`flex flex-col items-center justify-center h-full min-h-[150px] border-2 border-dashed rounded-xl cursor-pointer transition-all 
                ${errors.img ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:bg-slate-50'}`}
                            >
                                {imgPreview ? (
                                    <div className="relative w-full h-[150px] p-2">
                                        <img src={imgPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity rounded-lg">
                                            <p className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Ganti Gambar</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="mx-auto w-12 h-12 mb-3 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-slate-500">Klik untuk upload gambar</p>
                                        <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG (Maks 2MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                            {errors.img && <p className="text-xs text-red-500">{errors.img}</p>}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={closeDialog} className="text-slate-900">
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
