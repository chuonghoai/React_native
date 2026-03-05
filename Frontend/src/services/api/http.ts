import { ENV } from "@/src/constants/env";
import { authStore } from "@/src/stores/auth.store";
import { router } from "expo-router";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = authStore.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.status === 401 || res.status === 403) {
        console.log("Token không hợp lệ");
        await authStore.clear();
        router.replace("/(auth)/login");
        throw new Error("Phiên đăng nhập hết hạn");
    }

    if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        const msg = errorJson?.message ?? `Lỗi HTTP ${res.status}`;
        throw new Error(msg);
    }

    const json = await res.json();
    return json as T;

  } catch (error: any) {
    console.log("HTTP Error Detail:", error.message);

    if (error.name === 'RangeError' && error.message.includes('status provided (0)')) {
         throw new Error("Dữ liệu quá tải hoặc mất kết nối Server.");
    }

    if (error.name === 'AbortError') {
        throw new Error("Timeout.");
    }

    if (error instanceof TypeError || error.message?.includes("Network request failed")) {
         throw new Error("Không thể kết nối đến Server.");
    }
    
    throw error;
  }
}

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const token = authStore.getToken();
  const headers: Record<string, string> = {}; 

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401 || res.status === 403) {
      await authStore.clear();
      router.replace("/(auth)/login");
      throw new Error("Phiên đăng nhập hết hạn");
    }

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message ?? `Lỗi HTTP ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    throw error;
  }
}

export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, formData: FormData) => uploadRequest<T>(path, formData),
};