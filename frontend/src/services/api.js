import axios from "axios";
import { mockApi, isMockMode } from "./mockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const USE_MOCK = isMockMode();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
});

export async function fetchDashboard() {
  if (USE_MOCK) return mockApi.dashboard();
  const { data } = await api.get("/dashboard/");
  return data;
}

export async function fetchUsers() {
  if (USE_MOCK) return mockApi.users();
  const { data } = await api.get("/users/");
  return data;
}

export async function fetchProviders() {
  if (USE_MOCK) return mockApi.providers();
  const { data } = await api.get("/providers/");
  return data;
}

export async function createRequest(payload) {
  if (USE_MOCK) return mockApi.createRequest(payload);
  const { data } = await api.post("/requests/", payload);
  return data;
}

export async function fetchMyRequests(userId, userRole) {
  if (USE_MOCK) return mockApi.myRequests(userId, userRole);
  const { data } = await api.get(`/my-requests/?user_id=${userId}&user_role=${userRole}`);
  return data;
}

export async function fetchProviderInbox(providerId) {
  if (USE_MOCK) return mockApi.providerInbox(providerId);
  const { data } = await api.get(`/provider-inbox/?provider_id=${providerId}`);
  return data;
}

export async function createOffer(payload) {
  if (USE_MOCK) return mockApi.createOffer(payload);
  const { data } = await api.post("/offers/", payload);
  return data;
}

export async function fetchRequestOffers(requestId) {
  if (USE_MOCK) return mockApi.requestOffers(requestId);
  const { data } = await api.get(`/requests/${requestId}/offers/`);
  return data;
}

export async function acceptOffer(offerId) {
  if (USE_MOCK) return mockApi.acceptOffer(offerId);
  const { data } = await api.post(`/offers/${offerId}/accept/`);
  return data;
}

export async function rejectOffer(offerId) {
  if (USE_MOCK) return mockApi.rejectOffer(offerId);
  const { data } = await api.post(`/offers/${offerId}/reject/`);
  return data;
}

export async function completeRequest(requestId) {
  if (USE_MOCK) return mockApi.completeRequest(requestId);
  const { data } = await api.post(`/requests/${requestId}/complete/`);
  return data;
}

export async function createRating(payload) {
  if (USE_MOCK) return mockApi.createRating(payload);
  const { data } = await api.post("/ratings/", payload);
  return data;
}

export async function login(phone, pin) {
  if (USE_MOCK) return mockApi.login(phone, pin);
  const formData = new FormData();
  formData.append("phone", phone);
  formData.append("pin", pin);
  const { data } = await api.post("/auth/login/", formData);
  return data;
}

export async function register(payload) {
  if (USE_MOCK) return mockApi.register(payload);
  const { data } = await api.post("/auth/register/", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}
