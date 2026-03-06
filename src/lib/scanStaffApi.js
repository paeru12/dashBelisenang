import api from "./axios";

const BASE = "/vi4/events";

/* =========================
   ASSIGN SCAN STAFF
========================= */

export const assignScanStaff = (eventId, payload) =>
   api.post(`${BASE}/${eventId}/scan-staff`, payload);

/* =========================
   GET STAFF LIST
========================= */

export const getScanStaffUsers = () =>
   api.get(`/vi4/staffs/my-assignments`);

export const getScanAssignments = () =>
   api.get("/vi4/staffs/events");

export const acceptScanAssignment = (id) =>
   api.post(`/vi4/staffs/assignments/${id}/accept`);