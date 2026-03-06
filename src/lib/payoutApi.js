// src/lib/payoutApi.js
import axios from "@/lib/axios";

const BASE_PROMOTOR = "/vi4/payout";
const BASE_ADMIN = "/vi4/payoutAdmin";

/* ============================================================
   PROMOTOR API
   ============================================================ */

export const getPayoutDashboard = () =>
  axios.get(`${BASE_PROMOTOR}/dashboard`).then((r) => r.data.data);

export const getPayoutHistory = () =>
  axios.get(`${BASE_PROMOTOR}/history`).then((r) => r.data.data);

export const requestPayout = (amount) =>
  axios.post(`${BASE_PROMOTOR}`, { amount }).then((r) => r.data);

export const getPromotorBankInfo = () =>
  axios.get(`${BASE_PROMOTOR}/bank/info`).then((r) => r.data.data);

/* ============================================================
   ADMIN API
   ============================================================ */

export const adminGetPayoutList = () =>
  axios.get(`${BASE_ADMIN}`).then((r) => r.data.data);

export const adminGetPayoutDetail = (id) =>
  axios.get(`${BASE_ADMIN}/${id}`).then((r) => r.data.data);

export const adminApprovePayout = (id) =>
  axios.post(`${BASE_ADMIN}/${id}/approve`).then((r) => r.data);

export const adminRejectPayout = (id) =>
  axios.post(`${BASE_ADMIN}/${id}/reject`).then((r) => r.data);
