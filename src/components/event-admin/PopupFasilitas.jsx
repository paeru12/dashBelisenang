"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/components/common/BaseModal";
import { getAllFasilitas } from "@/lib/fasilitasApi";
import { addEventFasilitas, deleteEventFasilitas } from "@/lib/eventExtrasApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { successAlert } from "@/lib/alert";

export default function PopupFasilitas({ open, onClose, event, onSuccess }) {
  const [list, setList] = useState([]);
  const [media, setMedia] = useState("");
  const [search, setSearch] = useState("");

  async function fetchMaster() {
    const res = await getAllFasilitas();
    setList(res.data.data);
    setMedia(res.data.media);
  }

  useEffect(() => {
    if (open) fetchMaster();
  }, [open]);

  const existing = event.fasilitas?.map((f) => f.id) ?? [];

  async function toggle(fasilitasId, selected) {
    if (selected) {
      await deleteEventFasilitas(event.id, fasilitasId);
    } else {
      await addEventFasilitas(event.id, fasilitasId);
    }

    await successAlert("Success", "Fasilitas berhasil diperbarui");

    onSuccess?.();
  }

  const filteredList = list.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Kelola Fasilitas"
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-6">

        {/* SEARCH BAR */}
        <Input
          placeholder="Cari fasilitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-slate-300"
        />

        {/* EMPTY STATE */}
        {filteredList.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            Tidak ada fasilitas ditemukan.
          </div>
        )}

        {/* GRID LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {filteredList.map((f) => {
            const selected = existing.includes(f.id);

            return (
              <div
                key={f.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl border shadow-sm transition
                  ${selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`${media}${f.icon?.replace(/^\/+/, "")}`}
                    alt={f.name}
                    className="w-10 h-10 object-contain"
                  />

                  <div>
                    <p className="font-semibold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-500">
                      {selected ? "Aktif di event ini" : "Tersedia"}
                    </p>
                  </div>
                </div>

                <Button
                  variant={selected ? "destructive" : "default"}
                  className="rounded-lg"
                  onClick={() => toggle(f.id, selected)}
                >
                  {selected ? "Remove" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </BaseModal>
  );
}