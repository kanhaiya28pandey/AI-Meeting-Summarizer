import type { Meeting } from "../types/meeting";
import type { ApiError } from "../types/api";
import { ApiClientError } from "../types/api";

export { ApiClientError };

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/+$/, "");

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiClientError(
      "Unable to connect to the server. Please make sure the backend is running and try again.",
      0
    );
  }

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

  uploadMeeting: (
    file: File,
    title?: string,
    onProgress?: (percent: number) => void
  ): Promise<Meeting> => {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}/meetings/upload`;
      const formData = new FormData();
      formData.append("file", file);
      if (title && title.trim()) {
        formData.append("title", title.trim());
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Accept", "application/json");
      // 5-minute timeout matching backend processing capacity
      xhr.timeout = 300000;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        let responseData: any;
        try {
          responseData = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          // Non-JSON response
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          if (!responseData || !responseData.id) {
            reject(
              new ApiClientError(
                "Invalid server response: meeting ID was not returned",
                xhr.status,
                responseData
              )
            );
            return;
          }
          resolve(responseData as Meeting);
        } else {
          const errorMsg =
            responseData?.message ||
            responseData?.error ||
            `Upload failed with HTTP status ${xhr.status}`;
          reject(new ApiClientError(errorMsg, xhr.status, responseData));
        }
      };

      xhr.onerror = () => {
        reject(
          new ApiClientError(
            "Unable to connect to the server. Please make sure the backend is running and try again.",
            0
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new ApiClientError(
            "Upload and processing request timed out. Please try again.",
            408
          )
        );
      };

      xhr.send(formData);
    });
  },
};
