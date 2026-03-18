import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
});

export async function fetchDashboard() {
  const { data } = await api.get("/dashboard/");
  return data;
}

export async function fetchUsers() {
  const { data } = await api.get("/users/");
  return data;
}

export async function fetchProviders() {
  const { data } = await api.get("/providers/");
  return data;
}

export async function createRequest(payload) {
  const { data } = await api.post("/requests/", payload);
  return data;
}

export async function fetchProviderInbox(providerId) {
  const { data } = await api.get(`/provider-inbox/?provider_id=${providerId}`);
  return data;
}

export async function createOffer(payload) {
  const { data } = await api.post("/offers/", payload);
  return data;
}

export async function fetchRequestOffers(requestId) {
  const { data } = await api.get(`/requests/${requestId}/offers/`);
  return data;
}

export async function acceptOffer(offerId) {
  const { data } = await api.post(`/offers/${offerId}/accept/`);
  return data;
}

export async function rejectOffer(offerId) {
  const { data } = await api.post(`/offers/${offerId}/reject/`);
  return data;
}

export async function completeRequest(requestId) {
  const { data } = await api.post(`/requests/${requestId}/complete/`);
  return data;
}

export async function submitRating(payload) {
  const { data } = await api.post("/ratings/", payload);
  return data;
}

export async function createRating(payload) {
  const { data } = await api.post("/ratings/", payload);
  return data;
}
