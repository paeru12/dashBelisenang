"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/contexts/AuthContext";
import SectionCard from "@/components/common/SectionCard";
import DragDropUpload from "@/components/common/DragDropUpload";
import InputField from "@/components/common/InputField";
import { Skeleton } from "@/components/ui/skeleton";

import { Instagram, Globe, Facebook, Youtube, Music2 } from "lucide-react";
import { extractUsername } from "@/utils/socialParser";
import { validateSocialUrl } from "@/utils/socialValidation";
import { getOneCreator, updateCreator } from "@/lib/creatorApi";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert } from "@/lib/alert";

export default function OrganizerSettings() {
    const { user } = useAuth();

    const { data: res, mutate, isLoading } = useSWR(
        user?.creator_id ? ["creator-setting", user.creator_id] : null,
        () => getOneCreator(user.creator_id)
    );

    const creator = res?.data?.data;

    /* =============================
        LOCAL FORM STATE
    ============================= */
    const [data, setData] = useState({
        name: "",
        imagePreview: null,
        social_link: {
            instagram: "",
            tiktok: "",
            facebook: "",
            youtube: "",
            website: "",
        },
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState("");

    /* =============================================================
        Sync data after SWR loaded
    ============================================================= */
    useEffect(() => {
        if (creator) {
            setData({
                name: creator?.name || "",
                imagePreview: creator?.image || null,
                social_link: creator?.social_link || {},
            });
        }
    }, [creator]);

    const onChange = (obj) => setData(obj);

    /* =============================================================
        VALIDASI NAMA ORGANIZER
    ============================================================= */
    const validateName = (val) => {
        if (!val || val.trim().length === 0) return "Nama wajib diisi";
        if (val.trim().length < 3) return "Nama minimal 3 karakter";
        return "";
    };

    /* =============================================================
        UPLOAD IMAGE VALIDASI (rasio 1:1 + max 2MB)
    ============================================================= */
    const handleUpload = (file) => {
        if (file.size > 2 * 1024 * 1024) {
            setImageError("Ukuran maksimal 2MB");
            return;
        }

        const img = new Image();
        img.onload = () => {
            const { width, height } = img;
            if (width !== height) {
                setImageError("Rasio gambar harus 1:1");
                return;
            }

            setImageError("");
            setImageFile(file);
            setData({ ...data, imagePreview: URL.createObjectURL(file) });
        };

        img.src = URL.createObjectURL(file);
    };

    /* =============================================================
        SAVE
    ============================================================= */
    const handleSave = async () => {
        // VALIDATE NAME
        const nameErr = validateName(data.name);
        if (nameErr) {
            setErrors((prev) => ({ ...prev, name: nameErr }));
            return;
        }

        try {
            const fd = new FormData();
            fd.append("name", data.name);
            fd.append("social_link", JSON.stringify(data.social_link));
            if (imageFile) fd.append("image", imageFile);

            await updateCreator(creator.id, fd);
            await mutate();

            successAlert("Berhasil", "Organizer berhasil diperbarui");
        } catch (err) {
            console.log(err.response);
            errorAlert("Gagal", err?.response?.data?.message || "Error update");
        }
    };

    /* =============================================================
        SKELETON LOADING
    ============================================================= */
    if (isLoading || !creator) {
        return (
            <SectionCard title="Organizer Setting">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="md:col-span-3 space-y-4">
                        <Skeleton className="w-full h-12 rounded-lg" />
                        <Skeleton className="w-full h-12 rounded-lg" />
                        <Skeleton className="w-full h-12 rounded-lg" />
                        <Skeleton className="w-full h-12 rounded-lg" />
                    </div>
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Organizer Setting">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* LEFT — UPLOAD IMAGE */}
                <DragDropUpload
                    title="Profile Organizer"
                    preview={data.imagePreview}
                    aspect="aspect-square"
                    hint="Ratio 1:1 • Max 2MB"
                    error={imageError}
                    onUpload={handleUpload}
                    onRemove={() =>
                        onChange({ ...data, imagePreview: null })
                    }
                />

                {/* RIGHT — FORM */}
                <div className="md:col-span-3 space-y-6">
                    <InputField
                        label="Nama Organizer *"
                        value={data.name}
                        onChange={(v) => {
                            setData({ ...data, name: v });
                            setErrors((prev) => ({
                                ...prev,
                                name: validateName(v),
                            }));
                        }}
                        error={errors.name}
                    />

                    {/* SOCIAL MEDIA */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Instagram */}
                        <InputField
                            label={
                                <div className="flex items-center gap-2">
                                    <Instagram size={18} className="text-pink-500" />
                                    Instagram
                                </div>
                            }
                            placeholder="https://instagram.com/username"
                            value={data.social_link?.instagram || ""}
                            onChange={(v) => {
                                const isValid = validateSocialUrl(v);
                                onChange({
                                    ...data,
                                    social_link: {
                                        ...data.social_link,
                                        instagram: isValid ? v : "",
                                    },
                                });
                            }}
                            error={
                                data.social_link?.instagram &&
                                    !validateSocialUrl(data.social_link.instagram)
                                    ? "URL tidak valid"
                                    : ""
                            }
                        />

                        {/* TikTok */}
                        <InputField
                            label={
                                <div className="flex items-center gap-2">
                                    <Music2 size={18} className="text-black" />
                                    TikTok
                                </div>
                            }
                            placeholder="https://tiktok.com/@username"
                            value={data.social_link?.tiktok || ""}
                            onChange={(v) => {
                                const isValid = validateSocialUrl(v);
                                onChange({
                                    ...data,
                                    social_link: {
                                        ...data.social_link,
                                        tiktok: isValid ? v : "",
                                    },
                                });
                            }}
                            error={
                                data.social_link?.tiktok &&
                                    !validateSocialUrl(data.social_link.tiktok)
                                    ? "URL tidak valid"
                                    : ""
                            }
                        />

                        {/* Facebook */}
                        <InputField
                            label={
                                <div className="flex items-center gap-2">
                                    <Facebook size={18} className="text-blue-500" />
                                    Facebook
                                </div>
                            }
                            placeholder="https://facebook.com/username"
                            value={data.social_link?.facebook || ""}
                            onChange={(v) => {
                                const isValid = validateSocialUrl(v);
                                onChange({
                                    ...data,
                                    social_link: {
                                        ...data.social_link,
                                        facebook: isValid ? v : "",
                                    },
                                });
                            }}
                            error={
                                data.social_link?.facebook &&
                                    !validateSocialUrl(data.social_link.facebook)
                                    ? "URL tidak valid"
                                    : ""
                            }
                        />

                        {/* YouTube */}
                        <InputField
                            label={
                                <div className="flex items-center gap-2">
                                    <Youtube size={18} className="text-red-500" />
                                    YouTube
                                </div>
                            }
                            placeholder="https://youtube.com/@username"
                            value={data.social_link?.youtube || ""}
                            onChange={(v) => {
                                const isValid = validateSocialUrl(v);
                                onChange({
                                    ...data,
                                    social_link: {
                                        ...data.social_link,
                                        youtube: isValid ? v : "",
                                    },
                                });
                            }}
                            error={
                                data.social_link?.youtube &&
                                    !validateSocialUrl(data.social_link.youtube)
                                    ? "URL tidak valid"
                                    : ""
                            }
                        />

                        {/* Website */}
                        <InputField
                            label={
                                <div className="flex items-center gap-2">
                                    <Globe size={18} className="text-slate-600" />
                                    Website
                                </div>
                            }
                            placeholder="https://example.com"
                            value={data.social_link?.website || ""}
                            onChange={(v) => {
                                const isValid = validateSocialUrl(v);
                                onChange({
                                    ...data,
                                    social_link: {
                                        ...data.social_link,
                                        website: isValid ? v : "",
                                    },
                                });
                            }}
                            error={
                                data.social_link?.website &&
                                    !validateSocialUrl(data.social_link.website)
                                    ? "URL tidak valid"
                                    : ""
                            }
                        />

                    </div>

                    <Button className="mt-4" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </SectionCard>
    );
}