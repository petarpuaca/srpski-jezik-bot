const API_BASE_URL = "https://localhost:7186/api";

export const getAuthToken = () => sessionStorage.getItem("jwtToken");

export const setAuthToken = (token: string) => sessionStorage.setItem("jwtToken", token);

export const clearAuthToken = () => sessionStorage.removeItem("jwtToken");

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  },
};

export const extractIndexFromEmail = (email: string): string | null => {
  if (!email.endsWith("@fon.student")) return null;
  const base = email.split("@")[0];
  if (base.length !== 8) return null;
  return base.slice(0, 4) + "/" + base.slice(4, 8);
};
