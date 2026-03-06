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
