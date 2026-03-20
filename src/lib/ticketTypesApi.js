import api from "./axios";

const route = "/vi4/ticket-types";

// CREATE
export const createTicketType = (eventId, data) => {
  return api.post(`${route}/${eventId}/create`, data);
};

// UPDATE
export const updateTicketType = (eventId, ticketId, data) => {
  return api.put(`${route}/${eventId}/update/${ticketId}`, data);
};

// DELETE
export const deleteTicketType = (eventId, ticketId) => {
  return api.delete(`${route}/${eventId}/delete/${ticketId}`);
};

export const getTicketGroup = () => {
  return api.get(`${route}/ticket-group`);
};

// =====================
// BUNDLE API
// =====================

export const getTicketBundles = (eventId) => {
  return api.get(`${route}/${eventId}/bundles`);
};

export const createTicketBundle = (eventId, data) => {
  return api.post(`${route}/${eventId}/bundles`, data);
};

export const updateTicketBundle = (eventId, bundleId, data) => {
  return api.put(`${route}/${eventId}/bundles/${bundleId}`, data);
};

export const deleteTicketBundle = (eventId, bundleId) => {
  return api.delete(`${route}/${eventId}/bundles/${bundleId}`);
};
