"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Login berhasil");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Email atau password salah"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-slate-950">

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-slate-500 to-blue-600 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)] opacity-20" />
      </div>

      {/* LEFT BRANDING */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 text-white px-16">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
              <Ticket size={28} />
              <span className="font-semibold text-lg">
                Belisenang.com
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Event Management
            <br />
            Platform Modern
          </h1>

          <p className="text-white/80 text-lg leading-relaxed">
            Kelola event, pantau penjualan, dan optimalkan revenue
            dalam satu dashboard profesional berkelas enterprise.
          </p>
        </motion.div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex flex-1 items-center justify-center relative z-10 p-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-10"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Password
              </label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {submitting ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-slate-500 mt-4 space-y-2">

              <p>
                Don’t have an account?{" "}
                <span
                  onClick={() => router.push("/register")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition"
                >
                  Create one now
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
  );
}
