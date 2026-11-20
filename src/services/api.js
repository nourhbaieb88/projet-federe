const isLocalDevelopmentHost = () => {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const getApiBaseUrl = () => {
  const configuredBaseUrl = process.env.REACT_APP_API_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (isLocalDevelopmentHost()) {
    return "http://localhost:8000/api";
  }

  return "";
};

const API_BASE_URL = getApiBaseUrl();

const clearAuthStorage = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeEstablishment = (establishment = {}) => {
  const name = establishment.name ?? establishment.title ?? "";
  const address = establishment.address ?? establishment.location ?? "";
  const latitude = toNumber(establishment.latitude ?? establishment.lat);
  const longitude = toNumber(establishment.longitude ?? establishment.lng);
  const rating = toNumber(establishment.average_rating ?? establishment.rating) ?? 0;

  return {
    ...establishment,
    name,
    title: name,
    address,
    location: address,
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    rating,
    average_rating: rating,
    total_reviews: establishment.total_reviews ?? 0,
  };
};

const normalizeReservation = (reservation = {}) => {
  const numberOfPeople = toNumber(reservation.number_of_people ?? reservation.guests) ?? 0;
  const slotReservedPeople = toNumber(reservation.slot_reserved_people) ?? numberOfPeople;
  const slotCapacity = toNumber(reservation.slot_capacity) ?? null;
  const remainingCapacity = toNumber(reservation.remaining_capacity);

  return {
    ...reservation,
    number_of_people: numberOfPeople,
    guests: numberOfPeople,
    slot_reserved_people: slotReservedPeople,
    slot_capacity: slotCapacity,
    remaining_capacity:
      remainingCapacity ?? (slotCapacity !== null ? Math.max(slotCapacity - slotReservedPeople, 0) : null),
  };
};

const normalizeCollection = (payload, mapper) => {
  if (Array.isArray(payload)) {
    return payload.map(mapper);
  }

  if (payload && Array.isArray(payload.results)) {
    return {
      ...payload,
      results: payload.results.map(mapper),
    };
  }

  return mapper(payload);
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  refreshPromise = fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.access) {
        throw new Error(data.detail || "Token refresh failed");
      }

      localStorage.setItem("access_token", data.access);
      return data.access;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const apiCall = async (endpoint, options = {}, allowRetry = true) => {
  if (!API_BASE_URL) {
    throw new Error(
      "Configuration API manquante. Definissez REACT_APP_API_URL pour les environnements distants."
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    allowRetry &&
    token &&
    !endpoint.includes("/accounts/token/")
  ) {
    try {
      await refreshAccessToken();
      return apiCall(endpoint, options, false);
    } catch (error) {
      clearAuthStorage();
      window.location.href = "/login";
      throw error;
    }
  }

  if (response.status === 204) {
    return {};
  }

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      data = { detail: rawBody };
    }
  }

  if (!response.ok) {
    let errorMessage = data.detail || data.message || "";

    if (!errorMessage && typeof data === "object" && Object.keys(data).length > 0) {
      errorMessage = Object.entries(data)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(" ")}`;
          }

          if (value && typeof value === "object") {
            return `${key}: ${JSON.stringify(value)}`;
          }

          return `${key}: ${value}`;
        })
        .join(" | ");
    }

    throw new Error(errorMessage || "Une erreur est survenue");
  }

  return data;
};

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
    }

    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  getProfile: async () => {
    const profile = await apiCall("/accounts/users/me/", { method: "GET" });
    localStorage.setItem("user", JSON.stringify(profile));
    return profile;
  },

  updateProfile: async (userData) => {
    const profile = await apiCall("/accounts/users/update_profile/", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
    localStorage.setItem("user", JSON.stringify(profile));
    return profile;
  },

  requestPasswordReset: (email) =>
    apiCall("/accounts/password-reset/request/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  confirmPasswordReset: ({ uid, token, newPassword, newPasswordConfirm }) =>
    apiCall("/accounts/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify({
        uid,
        token,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    }),

  logout: () => {
    clearAuthStorage();
  },
};

export const establishmentService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const data = await apiCall(`/establishments/${params ? `?${params}` : ""}`);
    return normalizeCollection(data, normalizeEstablishment);
  },

  getById: async (id) => {
    const data = await apiCall(`/establishments/${id}/`, { method: "GET" });
    return normalizeEstablishment(data);
  },

  getMine: async () => {
    const data = await apiCall("/establishments/mine/", { method: "GET" });
    return normalizeEstablishment(data);
  },

  create: (establishmentData) =>
    apiCall("/establishments/", {
      method: "POST",
      body: JSON.stringify(establishmentData),
    }),

  update: async (id, establishmentData) => {
    const data = await apiCall(`/establishments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(establishmentData),
    });
    return normalizeEstablishment(data);
  },

  delete: (id) =>
    apiCall(`/establishments/${id}/`, { method: "DELETE" }),

  getReviews: (id) =>
    apiCall(`/establishments/${id}/reviews/`, { method: "GET" }),

  addReview: (id, reviewData) =>
    apiCall(`/establishments/${id}/reviews/`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getServices: (id) =>
    apiCall(`/services/?establishment=${id}`, { method: "GET" }),
};

export const serviceService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/services/${params ? `?${params}` : ""}`);
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
      method: "PATCH",
      body: JSON.stringify(serviceData),
    }),

  delete: (id) =>
    apiCall(`/services/${id}/`, { method: "DELETE" }),
};

export const reservationService = {
  getAll: async () => {
    const data = await apiCall("/reservations/", { method: "GET" });
    return normalizeCollection(data, normalizeReservation);
  },

  getById: async (id) => {
    const data = await apiCall(`/reservations/${id}/`, { method: "GET" });
    return normalizeReservation(data);
  },

  create: async (reservationData) => {
    const data = await apiCall("/reservations/", {
      method: "POST",
      body: JSON.stringify(reservationData),
    });
    return normalizeReservation(data);
  },

  update: async (id, reservationData) => {
    const data = await apiCall(`/reservations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(reservationData),
    });
    return normalizeReservation(data);
  },

  cancel: async (id) => {
    const data = await apiCall(`/reservations/${id}/cancel/`, { method: "POST" });
    return normalizeReservation(data);
  },

  getStats: () =>
    apiCall("/reservations/stats/", { method: "GET" }),
};

export const reviewService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/reviews/${params ? `?${params}` : ""}`);
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
      method: "PATCH",
      body: JSON.stringify(reviewData),
    }),

  delete: (id) =>
    apiCall(`/reviews/${id}/`, { method: "DELETE" }),
};

export const messageService = {
  getAll: () =>
    apiCall("/messaging/conversations/", { method: "GET" }),

  getMessages: (conversationId) =>
    apiCall(`/messaging/conversations/${conversationId}/messages/`, { method: "GET" }),

  createConversation: (establishmentId) =>
    apiCall("/messaging/conversations/", {
      method: "POST",
      body: JSON.stringify({ establishment: establishmentId }),
    }),

  sendMessage: (conversationId, content) =>
    apiCall(`/messaging/conversations/${conversationId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  markAsRead: (conversationId) =>
    apiCall(`/messaging/conversations/${conversationId}/mark-read/`, {
      method: "POST",
    }),
};
