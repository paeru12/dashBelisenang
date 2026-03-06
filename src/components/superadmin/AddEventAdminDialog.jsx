"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createEventAdmin } from '@/services/superadminApi';

export function AddEventAdminDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    image: null,
  });
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImgPreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.image) newErrors.image = 'Foto wajib diunggah';
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      await createEventAdmin(data);
      toast.success('Admin berhasil ditambahkan');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Gagal menambahkan admin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl"> {/* Ukuran dialog diperlebar */}
        <DialogHeader>
          <DialogTitle>Tambah Event Admin</DialogTitle>
          <DialogDescription>Isi data lengkap administrator event baru.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* KOLOM KIRI: UPLOAD FOTO */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-700">Foto Profil *</label>
              <label
                className={`flex flex-col items-center justify-center h-full min-h-[250px] border-2 border-dashed rounded-xl cursor-pointer transition-all 
                ${errors.image ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:bg-slate-50'}`}
              >
                {imgPreview ? (
                  <div className="relative w-full h-full p-2">
                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity rounded-lg">
                      <p className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Ganti Foto</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-12 h-12 mb-3 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">Klik untuk upload foto</p>
                    <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG (Maks 2MB)</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
            </div>

            {/* KOLOM KANAN: INPUT DATA */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap *</label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className={errors.fullName ? 'border-red-500' : ''} />
                {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="admin@example.com" className={errors.email ? 'border-red-500' : ''} />
                {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Nomor Telepon</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0812345..." />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Password *</label>
                  <Input name="password" type="password" value={formData.password} onChange={handleChange} className={errors.password ? 'border-red-500' : ''} />
                </div>
                <div>
                  <label className="text-sm font-medium">Konfirmasi *</label>
                  <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'border-red-500' : ''} />
                </div>
              </div>
              {(errors.password || errors.confirmPassword) && (
                <p className="text-[10px] text-red-500">{errors.password || errors.confirmPassword}</p>
              )}

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? 'Proses...' : 'Simpan Admin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}