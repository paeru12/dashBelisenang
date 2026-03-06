"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ticket, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { registerPromotor } from "@/lib/promotorsApi";

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        organizer_name: "",
        phone: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (form.password !== form.confirm_password) {
            toast.error("Password tidak cocok");
            return;
        }

        setSubmitting(true);

        try {
            await registerPromotor(form);

            toast.success("Akun berhasil dibuat 🎉");
            router.push("/login");
        } catch (err) {
            console.error(err.response);
            toast.error(
                err?.response?.data?.message || "Gagal mendaftar"
            );
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen grid lg:grid-cols-2">

            {/* ================= LEFT PANEL ================= */}
            <div className="hidden lg:flex sticky top-0 h-screen text-white px-24 relative overflow-hidden">

                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-slate-500 to-blue-600 animate-gradient" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)] opacity-20" />
                </div>
                <div className="flex flex-col justify-center max-w-xl relative z-10">

                    <div className="mb-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 
                            bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                            <Ticket size={22} />
                            <span className="font-medium tracking-wide">
                                Belisenang.com
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-semibold leading-tight mb-6">
                        Mulai Bangun Event Profesionalmu
                    </h1>

                    <p className="text-white/80 leading-relaxed text-lg">
                        Daftar sekarang dan kelola event, penjualan tiket,
                        serta analytics dalam satu dashboard modern
                        berkelas enterprise.
                    </p>

                </div>
            </div>

            {/* ================= RIGHT PANEL ================= */}
            <div className="relative flex justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200">

                <div className="w-full max-w-lg py-16 px-5">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-2xl 
                        shadow-[0_40px_100px_rgba(0,0,0,0.12)] 
                        border border-slate-200 
                        p-8"
                    >

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Create Organizer Account
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Start managing your events today.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            <InputField
                                label="Full Name"
                                type={"text"}
                                value={form.full_name}
                                onChange={(v) => handleChange("full_name", v)}
                            />

                            <InputField
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(v) => handleChange("email", v)}
                            />

                            <InputField
                                label="Organizer Name"
                                type={"text"}
                                value={form.organizer_name}
                                onChange={(v) => handleChange("organizer_name", v)}
                            />

                            <InputField
                                label="Phone Number"
                                type={"number"}
                                value={form.phone}
                                onChange={(v) => handleChange("phone", v)}
                            />

                            <PasswordField
                                label="Password"
                                type={"text"}
                                value={form.password}
                                onChange={(v) => handleChange("password", v)}
                                show={showPassword}
                                setShow={setShowPassword}
                            />

                            <PasswordField
                                label="Confirm Password"
                                type={"text"}
                                value={form.confirm_password}
                                onChange={(v) => handleChange("confirm_password", v)}
                                show={showConfirm}
                                setShow={setShowConfirm}
                            />

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-11 rounded-xl 
                                bg-gradient-to-r from-indigo-600 to-blue-600 
                                hover:from-indigo-700 hover:to-blue-700 
                                text-white font-medium shadow-md transition"
                            >
                                {submitting ? "Creating..." : "Create Account"}
                            </Button>

                            <div className="text-center text-sm text-slate-500 mt-4 space-y-2">

                                <p>
                                    Already have an account?{" "}
                                    <span
                                        onClick={() => router.push("/login")}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition"
                                    >
                                        Sign in
                                    </span>
                                </p>

                                <p className="text-xs text-slate-400 pt-4 border-t">
                                    © 2026 Belisenang. Built with care by{" "}
                                    <a
                                        href="https://yukti.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Yukti.id
                                    </a>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function InputField({ label, type, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
        </div>
    );
}

function PasswordField({ label, value, onChange, show, setShow }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>

            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 rounded-lg pr-10 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600 transition"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
