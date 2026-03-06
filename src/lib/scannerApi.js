import api from "./axios";

const BASE = "vi4/scanner";

/* ================================
   SCAN TICKET
================================ */

export const scanTicket = (payload) => {

  return api.post(`${BASE}/scan`, payload);

};
