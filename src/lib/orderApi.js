// lib/orderApi.js
import axios from "@/lib/axios";

const BASE = "/vi4/orders";

function sanitizeParams(params) {
  if (!params) return params;

  return {
    ...params,
    start_date: params.start_date ?? null,
    end_date: params.end_date ?? null,
  };
}

export function getOrders(params) {
  return axios.get(`${BASE}/pagination`, {
    params: sanitizeParams(params),
  });
}

export function getOrderDetail(id) {
  return axios.get(`${BASE}/${id}`);
}

export function exportCSV(params) {
  return axios
    .get(`${BASE}/export/csv`, {
      params: sanitizeParams(params),
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

export function exportXLSX(params) {
  return axios
    .get(`${BASE}/export/xlsx`, {
      params: sanitizeParams(params),
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

export async function exportPDF(params) {
  const res = await axios.get(`${BASE}/export/pdf`, {
    params: sanitizeParams(params),
    responseType: "blob",
  });

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.pdf";
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function resendTicket(orderId){
  return axios.post(`${BASE}/${orderId}/resend-ticket`);
} 