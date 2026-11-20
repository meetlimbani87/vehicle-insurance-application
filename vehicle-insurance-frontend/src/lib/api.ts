const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Uploaded files (claim photos/policy documents/etc.) are served by a resource
// handler registered on the same Spring app, so they live under the same
// "/api" context-path as every other endpoint — NOT at the bare origin.
export function resolveUploadUrl(path: string) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Do not force redirect if token is missing or in mock mode
        console.warn(`[API Warning] ${endpoint} returned ${res.status}`);
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) {
      return null;
    }
    return res.json();
  } catch (error: any) {
    console.warn(`[API Fetch Error] Endpoint ${endpoint} failed:`, error.message);
    throw error;
  }
}

export async function apiUpload(endpoint: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return apiFetch(endpoint, { method: "POST", body: formData });
}
