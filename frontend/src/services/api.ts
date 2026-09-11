import type { Meeting } from "../types/meeting";
import type { ApiError } from "../types/api";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/+$/, "");

export class ApiClientError extends Error {
  public status: number;
  public details?: ApiError;

  constructor(message: string, status: number, details?: ApiError) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiError | undefined;
    try {
      errorData = await response.json();
    } catch {
      // Body may not be JSON
    }

    const errorMessage = errorData?.message || errorData?.error || `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  getMeetings: (): Promise<Meeting[]> => {
    return request<Meeting[]>("/meetings");
  },

  getMeetingById: (id: string): Promise<Meeting> => {
    return request<Meeting>(`/meetings/${encodeURIComponent(id)}`);
  },

  deleteMeeting: (id: string): Promise<void> => {
    return request<void>(`/meetings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  uploadMeeting: async (file: File, title?: string): Promise<Meeting> => {
    const formData = new FormData();
    formData.append("file", file);
    if (title && title.trim()) {
      formData.append("title", title.trim());
    }

    return request<Meeting>("/meetings/upload", {
      method: "POST",
      body: formData,
    });
  },
};
