import { API_BASE_URL } from "../config/api";
import { notifyUnauthorized } from "../utils/authEvents";

interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const isStandardResponse = <T>(payload: unknown): payload is StandardApiResponse<T> => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "message" in payload
  );
};

const buildHeaders = (existingHeaders: HeadersInit | undefined, hasBody: boolean): Headers => {
  const headers = new Headers(existingHeaders);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

export async function apiRequest<T>(
  path: string,
  { token, requiresAuth = true, body, headers: existingHeaders, ...rest }: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = buildHeaders(existingHeaders, body !== undefined && !(body instanceof FormData));

  if (requiresAuth) {
    const authToken = token ?? localStorage.getItem("token");

    if (!authToken) {
      throw new ApiError("Authentication required. Please log in.", 401);
    }

    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (response.status === 401) {
    const unauthorizedMessage =
      (typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : "Session expired. Please sign in again.") || "Session expired. Please sign in again.";

    notifyUnauthorized(unauthorizedMessage);
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? ((payload as { message?: string; error?: string }).message ||
            (payload as { message?: string; error?: string }).error ||
            response.statusText)
        : typeof payload === "string"
          ? payload
          : response.statusText;

    throw new ApiError(message || "Request failed", response.status);
  }

  if (isStandardResponse<T>(payload)) {
    if (!payload.success) {
      throw new ApiError(payload.message || "Request failed", response.status);
    }

    return (payload.data as T) ?? (null as T);
  }

  return payload as T;
}
