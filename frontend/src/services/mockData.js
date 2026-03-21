// Mock Data for Demo/Testing - No Backend Required

export const mockUsers = [
  { id: 1, name: "Ramesh Kumar", phone: "9000000001", pin: "123456", role: "customer", location: "Chilakaluripet", rating: 4.5, created_at: "2025-01-15T10:30:00Z" },
  { id: 2, name: "Suresh Electric Works", phone: "9100000001", pin: "123456", role: "provider", location: "Chilakaluripet", rating: 4.8, created_at: "2025-01-10T08:00:00Z" },
  { id: 3, name: "Admin", phone: "admin", pin: "123456", role: "admin", location: "Chilakaluripet", rating: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 4, name: "Lakshmi Devi", phone: "9000000002", pin: "123456", role: "customer", location: "Guntur", rating: 4.2, created_at: "2025-02-01T14:20:00Z" },
  { id: 5, name: "Venkata Plumber", phone: "9100000002", pin: "123456", role: "provider", location: "Tenali", rating: 4.6, created_at: "2025-01-20T09:15:00Z" },
];

export const mockProviders = [
  { id: 1, user_id: 2, user_name: "Suresh Electric Works", user_phone: "9100000001", service_type: "electrician", provider_type: "individual", is_active: true, rating: 4.8, max_service_km: 15, distance_km: 2.5, created_at: "2025-01-10T08:00:00Z" },
  { id: 2, user_id: 5, user_name: "Venkata Plumber", user_phone: "9100000002", service_type: "plumber", provider_type: "individual", is_active: true, rating: 4.6, max_service_km: 10, distance_km: 5.0, created_at: "2025-01-20T09:15:00Z" },
  { id: 3, user_id: 6, user_name: "Sri Ganesh Mechanics", user_phone: "9100000003", service_type: "mechanic", provider_type: "business", is_active: true, rating: 4.7, max_service_km: 20, distance_km: 8.2, created_at: "2025-01-25T11:30:00Z" },
  { id: 4, user_id: 7, user_name: "Kisan Tractor Rentals", user_phone: "9100000004", service_type: "tractor_rental", provider_type: "business", is_active: true, rating: 4.9, max_service_km: 30, distance_km: 12.0, created_at: "2025-02-01T07:45:00Z" },
  { id: 5, user_id: 8, user_name: "Arogya Medical Store", user_phone: "9100000005", service_type: "medicines", provider_type: "business", is_active: true, rating: 4.5, max_service_km: 5, distance_km: 1.0, created_at: "2025-02-05T10:00:00Z" },
  { id: 6, user_id: 9, user_name: "Green Fields Fertilizers", user_phone: "9100000006", service_type: "fertilizers", provider_type: "business", is_active: false, rating: 4.3, max_service_km: 25, distance_km: 15.5, created_at: "2025-02-10T08:30:00Z" },
];

export const mockRequests = [
  { id: 1, user_id: 1, category: "service", service_type: "electrician", product_name: "", quantity: "", description: "Fan repair needed", location: "Chilakaluripet", latitude: 16.0898, longitude: 80.167, preferred_time: "Today evening", status: "open", created_at: "2025-03-20T10:00:00Z" },
  { id: 2, user_id: 1, category: "medicine", service_type: "medicines", product_name: "Paracetamol", quantity: "2 strips", description: "Fever medicine needed", location: "Chilakaluripet", latitude: 16.0898, longitude: 80.167, preferred_time: "Tomorrow morning", status: "assigned", created_at: "2025-03-19T14:30:00Z" },
  { id: 3, user_id: 4, category: "farm", service_type: "fertilizers", product_name: "Urea", quantity: "50kg", description: "Need urea for paddy field", location: "Guntur", latitude: 16.3067, longitude: 80.4365, preferred_time: "This week", status: "completed", created_at: "2025-03-15T09:00:00Z" },
  { id: 4, user_id: 1, category: "service", service_type: "plumber", product_name: "", quantity: "", description: "Water pipe leakage", location: "Chilakaluripet", latitude: 16.0898, longitude: 80.167, preferred_time: "Urgent", status: "completed", created_at: "2025-03-18T11:00:00Z" },
];

export const mockOffers = [
  { id: 1, request_id: 1, provider_id: 1, provider_name: "Suresh Electric Works", price: 350, availability: "Available", eta_minutes: 45, delivery_option: "Home service", status: "pending", created_at: "2025-03-20T10:30:00Z" },
  { id: 2, request_id: 1, provider_id: 3, provider_name: "Sri Ganesh Mechanics", price: 500, availability: "Available", eta_minutes: 60, delivery_option: "Pickup only", status: "pending", created_at: "2025-03-20T11:00:00Z" },
  { id: 3, request_id: 2, provider_id: 5, provider_name: "Arogya Medical Store", price: 120, availability: "Available", eta_minutes: 30, delivery_option: "Home delivery", status: "accepted", created_at: "2025-03-19T15:00:00Z" },
  { id: 4, request_id: 4, provider_id: 2, provider_name: "Venkata Plumber", price: 400, availability: "Available", eta_minutes: 30, delivery_option: "Home service", status: "accepted", created_at: "2025-03-18T11:30:00Z" },
];

export const mockRatings = [
  { id: 1, request_id: 4, provider_id: 2, rating: 5, review: "Excellent service! Fixed the leak quickly.", created_at: "2025-03-18T14:00:00Z" },
  { id: 2, request_id: 3, provider_id: 6, rating: 4, review: "Good quality fertilizers.", created_at: "2025-03-16T10:00:00Z" },
];

export const mockDashboard = {
  open_requests: 1,
  active_providers: 5,
  accepted_offers: 2,
  completed_requests: 2,
};

// Mock API functions
export const mockApi = {
  login: async (phone, pin) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.phone === phone && u.pin === pin);
    if (!user) throw new Error("Invalid phone or PIN");
    return { user, token: "mock-jwt-token-" + Date.now() };
  },

  register: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const exists = mockUsers.find(u => u.phone === payload.phone);
    if (exists) throw new Error("Phone already registered");
    const newUser = {
      id: mockUsers.length + 1,
      ...payload,
      rating: null,
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return { success: true, user: newUser };
  },

  dashboard: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDashboard;
  },

  users: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers;
  },

  providers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProviders;
  },

  myRequests: async (userId, userRole) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRequests.filter(r => r.user_id === userId);
  },

  providerInbox: async (providerId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const provider = mockProviders.find(p => p.id === providerId);
    if (!provider) return [];
    // Return all open requests that match provider's service type
    return mockRequests.filter(r => 
      r.status === "open" && 
      (r.service_type === provider.service_type || r.category === "service")
    );
  },

  createRequest: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRequest = {
      id: mockRequests.length + 1,
      ...payload,
      status: "open",
      created_at: new Date().toISOString()
    };
    mockRequests.push(newRequest);
    return newRequest;
  },

  createOffer: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const provider = mockProviders.find(p => p.id === payload.provider);
    const newOffer = {
      id: mockOffers.length + 1,
      ...payload,
      provider_name: provider?.user_name || "Provider",
      status: "pending",
      created_at: new Date().toISOString()
    };
    mockOffers.push(newOffer);
    return newOffer;
  },

  acceptOffer: async (offerId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const offer = mockOffers.find(o => o.id === offerId);
    if (offer) offer.status = "accepted";
    const request = mockRequests.find(r => r.id === offer?.request_id);
    if (request) request.status = "assigned";
    return { success: true };
  },

  rejectOffer: async (offerId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const offer = mockOffers.find(o => o.id === offerId);
    if (offer) offer.status = "rejected";
    return { success: true };
  },

  completeRequest: async (requestId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const request = mockRequests.find(r => r.id === requestId);
    if (request) request.status = "completed";
    return { success: true };
  },

  createRating: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newRating = {
      id: mockRatings.length + 1,
      ...payload,
      created_at: new Date().toISOString()
    };
    mockRatings.push(newRating);
    return newRating;
  },

  requestOffers: async (requestId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOffers.filter(o => o.request_id === requestId);
  },
};

// Check if mock mode is enabled
export const isMockMode = () => {
  return import.meta.env.VITE_MOCK_MODE === "true" || !import.meta.env.VITE_API_URL;
};
