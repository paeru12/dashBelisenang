"use client";

import { useState, useRef } from "react";
import BaseModal from "@/components/common/BaseModal";
import { addSponsor } from "@/lib/eventExtrasApi";
import DragDropUpload from "@/components/common/DragDropUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert } from "@/lib/alert";
const MAX_SIZE = 2 * 1024 * 1024;
export default function PopupSponsor({ open, onClose, eventId, onSuccess }) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const objUrlRef = useRef(null);

  /* ==========================================================
     HANDLE UPLOAD
  ========================================================== */
  const handleUpload = (file) => {
    setErrorMsg("");

    if (!file.type.startsWith("image/")) {
      return setErrorMsg("File harus berupa gambar.");
    }

    if (file.size > MAX_SIZE) {
      return setErrorMsg("Ukuran maksimal 2MB.");
    }

    // Cek rasio 1:1
    const img = new Image();
    const url = URL.createObjectURL(file);
    objUrlRef.current = url;

    img.onload = () => {
      if (img.width !== img.height) {
        setErrorMsg("Rasio gambar wajib 1:1 (square).");
        URL.revokeObjectURL(url);
        return;
      }

      // valid → set file
      setErrorMsg("");
      setPhoto(file);
      setPreview(url);
    };

    img.src = url;
  };

  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */
  const handleRemove = () => {
    if (objUrlRef.current) {
      URL.revokeObjectURL(objUrlRef.current);
      objUrlRef.current = null;
    }

    setPhoto(null);
    setPreview("");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      return errorAlert("Error", "Nama Sponsor wajib diisi.");
    }

    if (!photo) {
      return errorAlert("Error", "Foto Sponsor wajib di-upload.");
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", photo);

    try {
      await addSponsor(eventId, fd)
      await successAlert("Success", "Sponsor berhasil ditambahkan.");

      // reset
      setName("");
      handleRemove();

      onSuccess?.();
      onClose();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || err.message);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Add Sponsor" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* UPLOAD */}
        <DragDropUpload
          title="Logo Sponsor"
          preview={preview}
          aspect="aspect-square"
          hint="Rasio 1:1 • Maks 2MB"
          onUpload={handleUpload}
          onRemove={handleRemove}
          error={errorMsg}
        />

        {/* NAME */}
        <Input
          placeholder="Sponsor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:flex justify-end gap-3">
          <Button type="submit">
            Save
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}