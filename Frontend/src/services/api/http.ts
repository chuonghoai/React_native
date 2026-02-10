import { ENV } from "@/src/constants/env";
import { authStore } from "@/src/stores/auth.store";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = authStore.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        const msg = errorJson?.message ?? `Lỗi HTTP ${res.status}`;
        throw new Error(msg);
    }

    const json = await res.json();
    return json as T;

  } catch (error: any) {
    if (error instanceof TypeError || error.message?.includes("Network request failed") || error.message?.includes("status provided (0)")) {
         console.error("Lỗi kết nối mạng:", error);
         throw new Error("Không thể kết nối đến Server.");
    }
    throw error;
  }
}

export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};