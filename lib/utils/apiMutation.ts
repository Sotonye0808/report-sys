"use client";

import { CONTENT } from "@/config/content";

type MutationMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface MutationRequestOptions<TBody> {
  method?: MutationMethod;
  body?: TBody;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

interface MutationResult<TData> {
  ok: boolean;
  status: number;
  requestId?: string;
  data?: TData;
  error?: string;
}

function getDefaultErrorMessage() {
  return (CONTENT.errors as Record<string, string>).generic;
}

export async function apiMutation<TData = unknown, TBody = unknown>(
  url: string,
  options: MutationRequestOptions<TBody> = {},
): Promise<MutationResult<TData>> {
  const requestId = crypto.randomUUID();
  const method = options.method ?? "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-request-id": requestId,
        ...(options.headers ?? {}),
      },
      credentials: options.credentials ?? "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const responseRequestId = res.headers.get("x-request-id") ?? requestId;
    const text = await res.text().catch(() => "");
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      console.error("[apiMutation] invalid JSON response", {
        method,
        url,
        requestId: responseRequestId,
        status: res.status,
      });
      return {
        ok: false,
        status: res.status,
        requestId: responseRequestId,
        error: getDefaultErrorMessage(),
      };
    }

    if (!res.ok) {
      const parsedError =
        (json as ApiErrorPayload)?.error ??
        (json as ApiErrorPayload)?.message ??
        getDefaultErrorMessage();
      console.warn("[apiMutation] request failed", {
        method,
        url,
        requestId: responseRequestId,
        status: res.status,
      });
      return {
        ok: false,
        status: res.status,
        requestId: responseRequestId,
        error: parsedError,
      };
    }

    const data = json && typeof json === "object" && "success" in json ? json.data : json;
    console.info("[apiMutation] request succeeded", {
      method,
      url,
      requestId: responseRequestId,
      status: res.status,
    });

    return {
      ok: true,
      status: res.status,
      requestId: responseRequestId,
      data: data as TData,
    };
  } catch {
    console.error("[apiMutation] network failure", {
      method,
      url,
      requestId,
    });
    return {
      ok: false,
      status: 0,
      requestId,
      error: getDefaultErrorMessage(),
    };
  }
}
