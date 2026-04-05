// Configuration de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper pour gérer les requêtes
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ==================== AUTHENTICATION ====================
export const authService = {
  register: (userData) =>
    apiCall("/accounts/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: async (email, password) => {
    const response = await apiCall("/accounts/token/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access && response.refresh) {
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      // Store user data if available
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }
    return response;
  },

  getProfile: () =>
    apiCall("/accounts/users/me/", { method: "GET" }),

  updateProfile: (userData) =>
    apiCall("/accounts/users/update_profile/", {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      return data;
    }
    throw new Error("Token refresh failed");
  },
};

// ==================== ESTABLISHMENTS ====================
export const establishmentService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/establishments/${params ? "?" + params : ""}`);
  },

  getById: (id) =>
    apiCall(`/establishments/${id}/`, { method: "GET" }),

  create: (establishmentData) =>
    apiCall("/establishments/", {
      method: "POST",
      body: JSON.stringify(establishmentData),
    }),

  update: (id, establishmentData) =>
    apiCall(`/establishments/${id}/`, {
      method: "PUT",
      body: JSON.stringify(establishmentData),
    }),

  delete: (id) =>
    apiCall(`/establishments/${id}/`, { method: "DELETE" }),

  getReviews: (id) =>
    apiCall(`/establishments/${id}/reviews/`, { method: "GET" }),

  addReview: (id, reviewData) =>
    apiCall(`/establishments/${id}/add_review/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getServices: (id) =>
    apiCall(`/establishments/${id}/services/`, { method: "GET" }),
};

// ==================== SERVICES ====================
export const serviceService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/services/${params ? "?" + params : ""}`);
  },

  getById: (id) =>
    apiCall(`/services/${id}/`, { method: "GET" }),

  create: (serviceData) =>
    apiCall("/services/", {
      method: "POST",
      body: JSON.stringify(serviceData),
    }),

  update: (id, serviceData) =>
    apiCall(`/services/${id}/`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    }),

  delete: (id) =>
    apiCall(`/services/${id}/`, { method: "DELETE" }),
};

// ==================== RESERVATIONS ====================
export const reservationService = {
  getAll: () =>
    apiCall("/reservations/", { method: "GET" }),

  getById: (id) =>
    apiCall(`/reservations/${id}/`, { method: "GET" }),

  create: (reservationData) =>
    apiCall("/reservations/", {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  update: (id, reservationData) =>
    apiCall(`/reservations/${id}/`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),

  cancel: (id) =>
    apiCall(`/reservations/${id}/cancel/`, { method: "POST" }),
};

// ==================== REVIEWS ====================
export const reviewService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/reviews/${params ? "?" + params : ""}`);
  },

  getById: (id) =>
    apiCall(`/reviews/${id}/`, { method: "GET" }),

  create: (reviewData) =>
    apiCall("/reviews/", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  update: (id, reviewData) =>
    apiCall(`/reviews/${id}/`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    }),

  delete: (id) =>
    apiCall(`/reviews/${id}/`, { method: "DELETE" }),
};
