import api from "./axios";

const BASE = "/vi4/events";

/* ----------- GUEST STAR ----------- */
export const addGuestStar = (eventId, formData) =>
  api.post(`${BASE}/${eventId}/guest-star`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteGuestStar = (eventId, guestId) =>
  api.delete(`${BASE}/${eventId}/guest-star/${guestId}`);

/* ----------- SPONSOR ----------- */
export const addSponsor = (eventId, formData) =>
  api.post(`${BASE}/${eventId}/sponsor`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSponsor = (eventId, sponsorId) =>
  api.delete(`${BASE}/${eventId}/sponsor/${sponsorId}`);

/* ----------- FASILITAS ----------- */
export const addEventFasilitas = (eventId, fasilitasId) =>
  api.post(`${BASE}/${eventId}/fasilitas`, { fasilitas_id: fasilitasId });

export const deleteEventFasilitas = (eventId, fasilitasId) =>
  api.delete(`${BASE}/${eventId}/fasilitas/${fasilitasId}`);