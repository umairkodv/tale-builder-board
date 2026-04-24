export const API_BASE_URL = "http://localhost:3000";

const TOKEN_KEY = "sw_jwt_token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export interface ApiError extends Error {
  status?: number;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      /* ignore */
    }
    const err = new Error(message) as ApiError;
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

// Types
export interface Slide {
  id?: string;
  imageUrl: string;
  duration: number;
  ctaText?: string;
  ctaUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  slides: Slide[];
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  views?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user?: { email: string; name?: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
};

// Stories
export const storiesApi = {
  list: () => apiFetch<Story[]>("/stories"),
  get: (id: string) => apiFetch<Story>(`/stories/${id}`),
  create: (data: Partial<Story>) =>
    apiFetch<Story>("/stories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Story>) =>
    apiFetch<Story>(`/stories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/stories/${id}`, { method: "DELETE" }),
  publish: (id: string, published: boolean) =>
    apiFetch<Story>(`/stories/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    }),
};

// API Keys
export const apiKeysApi = {
  list: () => apiFetch<ApiKey[]>("/api-keys"),
  create: (name: string) =>
    apiFetch<ApiKey>("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/api-keys/${id}`, { method: "DELETE" }),
};
