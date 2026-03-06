"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import SectionCard from "@/components/common/SectionCard";
import { Eye, EyeOff } from "lucide-react";
import DragDropUpload from "@/components/common/DragDropUpload";

import {
    getOneUser,
    updateUser,
    updateUserPassword,
} from "@/lib/userApi";

import {
    successAlert,
    errorAlert,
    confirmAlert,
} from "@/lib/alert";

const MAX_SIZE = 2 * 1024 * 1024;

const GlobalProfile = () => {
    const { user, refetchMe } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState("");

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        confirm_password: "",
    });

    const getPasswordStrength = (password) => {
        if (!password) return { label: "", color: "", score: 0 };

        let score = 0;

        if (password.length >= 6) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1)
            return { label: "Weak", color: "text-red-500", score };

        if (score === 2 || score === 3)
            return { label: "Medium", color: "text-yellow-500", score };

        return { label: "Strong", color: "text-green-600", score };
    };

    const strength = getPasswordStrength(passwordForm.password);


    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const initialFormRef = useRef(null);
    const objectUrlRef = useRef(null);

    /* ================= FETCH PROFILE ================= */

    const fetchProfile = async () => {
        if (!user?.id) return;
        
        const data = await getOneUser(user.id);
        setProfile(data);

        const initial = {
            full_name: data.full_name,
            phone: data.phone || "",
        };

        setForm(initial);
        initialFormRef.current = initial;
    };

    useEffect(() => {
        const init = async () => {
            try {
                await fetchProfile();
            } catch {
                errorAlert("Error", "Gagal memuat profile");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [user]);

    /* ================= IMAGE VALIDATION ================= */

    const handleImageUpload = (file) => {
        if (!file.type.startsWith("image/")) {
            setAvatarError("File harus berupa gambar.");
            return;
        }

        if (file.size > MAX_SIZE) {
            setAvatarError("Ukuran maksimal 2MB.");
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;

        img.onload = () => {
            if (img.width !== img.height) {
                setAvatarError("Gambar harus 1:1.");
                URL.revokeObjectURL(objectUrl);
                return;
            }

            setAvatarError("");
            setAvatarPreview(objectUrl);
            setAvatarFile(file);
        };

        img.src = objectUrl;
    };

    /* ================= SAVE PROFILE ================= */

    const handleSaveProfile = async () => {
        const confirm = await confirmAlert({
            title: "Simpan Perubahan?",
            text: "Perubahan profile akan disimpan",
            confirmText: "Simpan",
        });

        if (!confirm.isConfirmed) return;

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("full_name", form.full_name);
            formData.append("phone", form.phone);

            if (avatarFile) {
                formData.append("image", avatarFile);
            }

            await updateUser(profile.id, formData);

            await refetchMe();     // 🔥 refresh auth context
            await fetchProfile();    // 🔥 refresh profile page

            successAlert("Berhasil", "Profile berhasil diperbarui");

            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }

            setAvatarFile(null);
            setAvatarPreview(null);

        } catch (err) {
            console.error(err);
            errorAlert(
                "Gagal",
                err?.response?.data?.message || "Gagal update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    /* ================= UPDATE PASSWORD ================= */

    const handleUpdatePassword = async () => {
        if (!passwordForm.current_password) {
            errorAlert("Error", "Password lama wajib diisi");
            return;
        }

        if (!passwordForm.password) {
            errorAlert("Error", "Password baru wajib diisi");
            return;
        }

        if (passwordForm.password !== passwordForm.confirm_password) {
            errorAlert("Error", "Konfirmasi password tidak sama");
            return;
        }

        if (strength.label === "Weak") {
            errorAlert("Password Lemah", "Gunakan minimal 6 karakter dengan huruf besar dan angka.");
            return;
        }

        const confirm = await confirmAlert({
            title: "Update Password?",
            text: "Password akan diperbarui",
            confirmText: "Update",
        });

        if (!confirm.isConfirmed) return;

        try {
            await updateUserPassword(profile.id, passwordForm);

            successAlert("Berhasil", "Password berhasil diperbarui");

            setPasswordForm({
                current_password: "",
                password: "",
                confirm_password: "",
            });

        } catch (err) {
            console.error(err.response);
            errorAlert(
                "Gagal",
                err?.response?.data?.message || "Gagal update password"
            );
        }
    };


    if (loading) return <ProfileSkeleton />;

    return (
        <>
            {/* 🔥 LOADING OVERLAY */}
            {saving && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-lg">
                        Saving changes...
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto py-4 space-y-8">

                <SectionCard title="Personal Information" description="Manage your account preferences and profile information">
                    <div className="grid md:grid-cols-4 gap-6 items-center">

                        <DragDropUpload
                            preview={avatarPreview || profile?.image}
                            aspect="aspect-square"
                            hint="Square 1:1, max 2MB"
                            onUpload={handleImageUpload}
                            onRemove={() => {
                                setAvatarPreview(null);
                                setAvatarFile(null);
                            }}
                            error={avatarError}
                        />

                        <div className="md:col-span-3 space-y-4">
                            <Input
                                value={form.full_name}
                                onChange={(e) =>
                                    setForm({ ...form, full_name: e.target.value })
                                }
                                placeholder="Full Name"
                            />

                            <Input value={profile?.email} disabled />

                            <Input
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                                placeholder="Phone Number"
                            />

                            <Button onClick={handleSaveProfile} variant="outline">Save Changes</Button>
                        </div>

                    </div>
                </SectionCard>

                {/* SECURITY */}
                <SectionCard title="Account Security" description="Manage your password and security settings">
                    <div className="grid grid-cols-2 gap-4">

                        {/* CURRENT */}
                        <div className="relative col-span-2">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                placeholder="Current Password"
                                className="pr-10"
                                value={passwordForm.current_password}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        current_password: e.target.value,
                                    })
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* NEW */}
                        <div>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    placeholder="New Password"
                                    className="pr-10"
                                    value={passwordForm.password}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            password: e.target.value,
                                        })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordForm.password && (
                                <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${strength.score <= 1
                                            ? "bg-red-500 w-1/4"
                                            : strength.score <= 3
                                                ? "bg-yellow-500 w-2/4"
                                                : "bg-green-500 w-full"
                                            }`}
                                    />
                                </div>
                            )}

                            {passwordForm.password && (
                                <p className={`text-xs mt-1 ${strength.color}`}>
                                    Strength: {strength.label}
                                </p>
                            )}

                        </div>

                        {/* CONFIRM */}
                        <div>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    className="pr-10"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            confirm_password: e.target.value,
                                        })
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6">
                        <Button variant="outline" onClick={handleUpdatePassword}>Update Password</Button>
                    </div>
                </SectionCard>

            </div>
        </>
    );
};

export default GlobalProfile;


function ProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8 animate-pulse">

            <div className="bg-white rounded-2xl p-6 flex gap-6">
                <div className="h-20 w-20 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-gray-200 rounded" />
                    <div className="h-4 w-60 bg-gray-200 rounded" />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-6">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="aspect-square bg-gray-200 rounded-2xl" />
                    <div className="md:col-span-3 space-y-4">
                        <div className="h-10 bg-gray-200 rounded" />
                        <div className="h-10 bg-gray-200 rounded" />
                        <div className="h-10 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-6">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </div>

        </div>
    );
}
