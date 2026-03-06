"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getMyCreators, updateCreator } from "@/lib/creatorApi";
import DataTables from "@/components/common/DataTables";
import { Button } from "@/components/ui/button";
import BaseModal from "@/components/common/BaseModal";
import DragDropUpload from "@/components/common/DragDropUpload";

export default function OrganizerManagement() {
  const { data: res, mutate } = useSWR("/my-creators", getMyCreators);
  const creators = res?.data?.data || [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [imageFile, setImageFile] = useState(null);

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name });
    setOpen(true);
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("name", form.name);
    if (imageFile) fd.append("image", imageFile);

    await updateCreator(editing.id, fd);
    setOpen(false);
    mutate();
  };

  return (
    <>
      <DataTables
        title="Organizer Management"
        description="Kelola organizer milik Anda"
        data={creators}
        loading={!res}
        columns={[
          { key: "image", label: "Image", type: "image" },
          { key: "name", label: "Name" },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <Button onClick={() => handleEdit(row)} size="sm">
                Edit
              </Button>
            ),
          },
        ]}
      />

      <BaseModal title="Edit Organizer" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <DragDropUpload
            preview={imageFile ? URL.createObjectURL(imageFile) : editing?.image}
            onUpload={(f) => setImageFile(f)}
            aspect="aspect-square"
            hint="1:1 image"
          />

          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </BaseModal>
    </>
  );
}