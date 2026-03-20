// /* =========================
//    FORMAT TANGGAL (ID)
// ========================= */
export function formatTanggalIndo(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// /* =========================
//    FORMAT JAM (HH:mm)
// ========================= */
// export function formatJam(timeString) {
//   if (!timeString) return "-";

//   // support "09:00:00" → "09:00"
//   return timeString.slice(0, 5);
// }

// /* =========================
//    FORMAT TANGGAL + JAM
//    (untuk detail event)
// ========================= */
export function formatTanggalJamIndo(date, time) {
  if (!date) return "-";

  const tanggal = formatTanggalIndo(date);
  const jam = time ? formatJam(time) : "";

  return jam ? `${tanggal}, ${jam}` : tanggal;
}

// /* =========================
//    RANGE EVENT
//    (30 Desember 2025 – 1 Januari 2026)
// ========================= */
// export function formatRangeTanggalIndo(start, end) {
//   if (!start || !end) return "-";

//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   // Jika masih bulan & tahun sama → ringkas
//   if (
//     startDate.getMonth() === endDate.getMonth() &&
//     startDate.getFullYear() === endDate.getFullYear()
//   ) {
//     return `${startDate.getDate()} – ${formatTanggalIndo(end).replace(
//       /^\d+\s/,
//       ""
//     )}`;
//   }

//   return `${formatTanggalIndo(start)} – ${formatTanggalIndo(end)}`;
// }

// /* =========================
//    FORMAT EVENT DATETIME (SMART + ZONE)
// ========================= */
export function formatEventDateTime({
  startDate,
  startTime,
  endDate,
  endTime,
  zone,
}) {
  if (!startDate && !endDate) return "-";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (t) => (t ? t.slice(0, 5) : "");

  const zoneLabel = zone ? ` ${zone}` : "";

  // =========================
  // 1️⃣ EVENT 1 HARI
  // =========================
  if (startDate && (!endDate || startDate === endDate)) {
    const dateText = formatDate(startDate);
    const startJam = formatTime(startTime);
    const endJam = formatTime(endTime);

    // Tanpa jam
    if (!startJam && !endJam) {
      return dateText;
    }

    // Dengan jam
    if (startJam && endJam) {
      return `${dateText} · ${startJam} – ${endJam}${zoneLabel}`;
    }

    return `${dateText} · ${startJam || endJam}${zoneLabel}`;
  }

  // =========================
  // 2️⃣ EVENT MULTI HARI
  // =========================
  const startText = startDate
    ? `${formatDate(startDate)}${startTime ? ` ${formatTime(startTime)}` : ""}`
    : "";

  const endText = endDate
    ? `${formatDate(endDate)}${endTime ? ` ${formatTime(endTime)}` : ""}`
    : "";

  // Tambahkan zona jika ada jam
  const hasTime = startTime || endTime;

  return `${startText} – ${endText}${hasTime ? zoneLabel : ""}`.trim();
}


// export function formatIsoIndo(isoString) {
//   if (!isoString) return "-";

//   // Pecah ISO → tanggal + waktu
//   const [date, timeWithMs] = isoString.split("T");
//   const time = timeWithMs ? timeWithMs.slice(0, 8) : null; // ambil "HH:mm:ss"

//   // Pakai formatter yang sudah kamu buat
//   const tanggal = formatTanggalIndo(date);
//   const jam = time ? formatJam(time) : "";

//   return jam ? `${tanggal}, ${jam}` : tanggal;
// }


// /* =========================
//    FORMAT RUPIAH
// ========================= */
// export function formatRupiah(value) {
//   if (!value) return "Rp 0";

//   return `Rp ${Number(value).toLocaleString("id-ID")}`;
// }

// utils/date.js

export function formatIsoIndo(dateInput) {
  if (!dateInput) return "-";

  const d = new Date(dateInput); // TIDAK ditambah offset

  const tgl = d.getDate().toString().padStart(2, "0");
  const bln = (d.getMonth() + 1).toString().padStart(2, "0");
  const thn = d.getFullYear();

  const jam = d.getHours().toString().padStart(2, "0");
  const mnt = d.getMinutes().toString().padStart(2, "0");

  return `${tgl}/${bln}/${thn} ${jam}:${mnt}`;
}

export function toDatetimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ==========================================================
// 🔥 3. Format Rupiah
// ==========================================================
export function formatRupiah(num) {
  if (num === null || num === undefined) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(num));
}