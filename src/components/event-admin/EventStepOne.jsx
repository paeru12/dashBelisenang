"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/common/SectionCard";
import InputField from "@/components/common/InputField";
import { TagInput } from "@/components/ui/tagsinput";
import { getProvinces, getRegencies } from "@/lib/regionApi";
import { getCategory } from "@/lib/categoryApi";
import DropdownSearch from "@/components/ui/DropdownSearch";
import DragDropUpload from "@/components/common/DragDropUpload";
import { validateSocialUrl } from "@/utils/socialValidation";
import { Instagram, Music2, Facebook, Youtube, Globe } from "lucide-react";
import FormSelect from "@/components/ui/formSelect";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/common/RichTextEditor"),
  { ssr: false }
);
function validateImage(file, type) {
  return new Promise((resolve, reject) => {
    if (!file) return reject("File tidak ditemukan");

    if (file.size > 2 * 1024 * 1024) {
      return reject("Ukuran maksimal 2MB");
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = function () {
      const { width, height } = img;

      if (type === "flyer" && (width !== 1062 || height !== 427)) {
        reject("Flyer harus 1062px x 427px");
        return;
      }

      if (type === "layout" && width !== height) {
        reject("Layout venue harus rasio 1:1");
        return;
      }

      resolve(true);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
}

export default function EventStepOne({
  data,
  onChange,
  onNext = () => { },
  readOnly = false,
  isEdit = false,
}) {
  const [errors, setErrors] = useState({});
  const [imageErrors, setImageErrors] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);


  const today = new Date().toISOString().split("T")[0];

  /* ================= MASTER DATA ================= */

  // Set label awal untuk Select Kategori
  useEffect(() => {
    if (data.category && categories.length > 0) {
      const found = categories.find(c => c.id === data.category);
      if (found) {
        // force selectedLabel ke context Select
        setTimeout(() => {
          const event = new CustomEvent("set-select-label", {
            detail: { key: "category", label: found.name }
          });
          window.dispatchEvent(event);
        }, 50);
      }
    }
  }, [data.category, categories]);

  useEffect(() => {
    if (data.timezone) {
      const event = new CustomEvent("set-select-label", {
        detail: { key: "timezone", label: data.timezone }
      });
      window.dispatchEvent(event);
    }
  }, [data.timezone]);

  useEffect(() => {
    async function loadMaster() {
      const catRes = await getCategory();
      const categoryList =
        catRes?.data?.data?.data ||
        catRes?.data?.data ||
        catRes?.data ||
        [];
      setCategories(categoryList);

      const provRes = await getProvinces();
      setProvinces(provRes.data.data.data || []);
    }
    loadMaster();
  }, []);

  useEffect(() => {
    async function loadRegenciesData() {
      if (!data.province) return;

      const selected = provinces.find(
        (p) => p.name === data.province
      );

      if (selected?.code) {
        const res = await getRegencies(selected.code);
        setRegencies(res.data.data.data || []);
      }
    }

    if (provinces.length) {
      loadRegenciesData();
    }
  }, [data.province, provinces]);


  /* ================= AUTO ADJUST DATE ================= */

  useEffect(() => {
    if (data.startDate && data.endDate) {
      if (data.endDate < data.startDate) {
        onChange({ ...data, endDate: data.startDate });
      }
    }
  }, [data.startDate]);

  /* ================= VALIDATION ================= */

  function validateField(key, value) {
    if (!value || value === "") {
      setErrors((prev) => ({ ...prev, [key]: "Field wajib diisi" }));
    } else {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  }

  function validateAll() {
    const required = [
      "name",
      "location",
      "category",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
      "timezone",
      "description",
      "terms",
      "keywords",
      "province",
      "district",
    ];

    let newErrors = {};

    // Validasi flyer khusus
    if (!data.flyer && !data.flyerPreview) {
      newErrors.flyer = "Flyer wajib diisi";
    }

    required.forEach((k) => {
      if (!data[k] || data[k] === "") {
        newErrors[k] = "Field wajib diisi";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  /* ================= UPLOAD ================= */

  async function upload(file, key) {
    try {
      await validateImage(file, key);

      // Clear error untuk field ini
      setImageErrors((prev) => ({ ...prev, [key]: null }));

      onChange({
        ...data,
        [key]: file,
        [`${key}Preview`]: URL.createObjectURL(file),
      });
    } catch (err) {
      setImageErrors((prev) => ({
        ...prev,
        [key]: err,
      }));
    }
  }


  /* ================= SUBMIT ================= */

  function handleNext() {
    if (!validateAll()) return;
    onNext();
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto space-y-6 ">

      {/* ================= INFORMASI EVENT ================= */}
      <SectionCard title="Informasi Event">
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT - FLYER */}
          <DragDropUpload
            title="Flyer Event *"
            preview={data.flyerPreview}
            aspect="aspect-[1062/427]"
            hint="1062x427px • Max 2MB"
            error={imageErrors.flyer}
            onUpload={(file) => upload(file, "flyer")}
            onRemove={() =>
              onChange({ ...data, flyer: null, flyerPreview: null })
            }
          />

          {/* RIGHT - BASIC INFO */}
          <div className="space-y-6">
            <InputField
              label="Nama Event *"
              value={data.name}
              onChange={(v) => {
                onChange({ ...data, name: v });
                validateField("name", v);
              }}
              error={errors.name}
            />

            <FormSelect
              label="Kategori"
              required
              value={data.category}
              onChange={(v) => {
                onChange({ ...data, category: v });
                validateField("category", v);
              }}
              items={categories}
              itemLabel="name"
              itemValue="id"
              placeholder="Pilih Kategori"
              error={errors.category}
            />
          </div>
        </div>
      </SectionCard>

      {/* ================= LOKASI EVENT ================= */}
      <SectionCard title="Lokasi Event">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT - LAYOUT VENUE */}
          <DragDropUpload
            title="Layout Event"
            preview={data.layoutPreview}
            aspect="aspect-square"
            hint="Rasio 1:1 • Max 2MB"
            error={imageErrors.layout}
            onUpload={(file) => upload(file, "layout")}
            onRemove={() =>
              onChange({ ...data, layout: null, layoutPreview: null })
            }
          />


          {/* RIGHT - LOCATION FORM */}
          <div className="space-y-6 md:col-span-2">

            <InputField
              label="Lokasi *"
              value={data.location}
              onChange={(v) => {
                onChange({ ...data, location: v });
                validateField("location", v);
              }}
              error={errors.location}
            />

            <InputField
              label="Maps URL"
              value={data.mapUrl}
              onChange={(v) => onChange({ ...data, mapUrl: v })}
            />

            <DropdownSearch
              label="Provinsi"
              items={provinces}
              value={data.province}
              itemKey="name"
              itemLabel="name"
              buttonPlaceholder="Pilih Provinsi"
              disabled={loadingMaster || readOnly}
              onSelect={async (provName) => {
                const selected = provinces.find(p => p.name === provName);

                onChange({
                  ...data,
                  province: provName,
                  district: ""
                });

                if (selected?.code) {
                  const res = await getRegencies(selected.code);
                  setRegencies(res.data.data.data || []);
                }
              }}

            />
            {errors.province && (
              <p className="text-xs text-red-500">
                {errors.province}
              </p>
            )}

            <DropdownSearch
              label="Kabupaten / Kota"
              items={regencies}
              value={data.district}
              itemKey="name"
              itemLabel="name"
              buttonPlaceholder="Pilih Kabupaten/Kota"
              disabled={!data.province || loadingMaster || readOnly}
              onSelect={(regName) => {
                onChange({
                  ...data,
                  district: regName
                });
              }}

            />
            {errors.district && (
              <p className="text-xs text-red-500">
                {errors.district}
              </p>
            )}
          </div>
        </div>
      </SectionCard>


      {/* ================= JADWAL ================= */}
      <SectionCard title="Jadwal Event">
        <div className="grid md:grid-cols-3 gap-6">
          <InputField
            type="date"
            min={today}
            label="Tanggal Mulai *"
            value={data.startDate}
            onChange={(v) => {
              onChange({ ...data, startDate: v });
              validateField("startDate", v);
            }}
            error={errors.startDate}
          />

          <InputField
            type="time"
            label="Jam Mulai *"
            value={data.startTime}
            onChange={(v) => {
              onChange({ ...data, startTime: v });
              validateField("startTime", v);
            }}
            error={errors.startTime}
          />

          <InputField
            type="date"
            min={data.startDate || today}
            label="Tanggal Selesai *"
            value={data.endDate}
            onChange={(v) => {
              onChange({ ...data, endDate: v });
              validateField("endDate", v);
            }}
            error={errors.endDate}
          />

          <InputField
            type="time"
            label="Jam Selesai *"
            value={data.endTime}
            onChange={(v) => {
              onChange({ ...data, endTime: v });
              validateField("endTime", v);
            }}
            error={errors.endTime}
          />

          <FormSelect
            label="Zona Waktu"
            required
            value={data.timezone}
            onChange={(v) => {
              onChange({ ...data, timezone: v });
              validateField("timezone", v);
            }}
            items={[
              { id: "WIB", name: "WIB" },
              { id: "WITA", name: "WITA" },
              { id: "WIT", name: "WIT" },
            ]}
            itemLabel="name"
            itemValue="id"
            placeholder="Pilih Zona Waktu"
            error={errors.timezone}
          />
        </div>
      </SectionCard>

      {/* ================= KONTEN ================= */}
      <SectionCard title="Konten Event">
        <EditorField
          label="Deskripsi Event *"
          value={data.description}
          onChange={(v) => {
            onChange({ ...data, description: v });
            validateField("description", v);
          }}
          error={errors.description}
        />

        <EditorField
          label="Syarat & Ketentuan *"
          value={data.terms}
          onChange={(v) => {
            onChange({ ...data, terms: v });
            validateField("terms", v);
          }}
          error={errors.terms}
        />
      </SectionCard>

      {/* ================= SOSIAL MEDIA ================= */}
      <SectionCard title="Sosial Media Event">
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
      </SectionCard>

      {/* ================= SEO ================= */}
      <SectionCard title="SEO & Keywords">
        <TagInput
          keywords={data.keywords || []}
          setKeywords={(newTags) =>
            onChange({ ...data, keywords: newTags })
          }
          maxKeywords={20}
        />
        {errors.keywords && (
          <p className="text-xs text-red-500 mt-1">
            {errors.keywords}
          </p>
        )}


      </SectionCard>

      <div className="grid md:justify-end">
        <Button onClick={handleNext}>
          {isEdit ? "Update Event" : "Next"}
        </Button>
      </div>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function EditorField({ label, value, onChange, error }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className={` mt-2 ${error ? "border-red-500" : ""}`}>
        <RichTextEditor value={value || ""} onChange={onChange} />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

