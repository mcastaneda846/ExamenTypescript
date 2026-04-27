import type { ApiResponse } from "@/types";

async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Respuesta inválida del servidor",
    } as ApiResponse<T>;
  }
}

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const runRequest = async () =>
    fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

  let res = await runRequest();

  const inputText = typeof input === "string" ? input : input.toString();
  const canRetryWithRefresh = !inputText.includes("/api/auth/refresh");

  if (res.status === 401 && canRetryWithRefresh) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (refreshRes.ok) {
      res = await runRequest();
    }
  }

  const data = await parseApiResponse<T>(res);
  return data;
}

