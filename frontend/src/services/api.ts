import type { Meeting } from "../types/meeting";
import type { ApiError } from "../types/api";
import type { AuthResponse, ChangePasswordData, LoginData, SignupData, UpdateProfileData, User } from "../types/auth";
import { ApiClientError } from "../types/api";

export { ApiClientError };

function getBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || host.includes("netlify.app") || host.includes("onrender.com")) {
      return "https://ai-meeting-summarizer-oamb.onrender.com/api";
    }
    return "/api";
  }
  return "http://localhost:8080/api";
}

const BASE_URL = getBaseUrl();

const TOKEN_KEY = "ai_meeting_token";
const USER_KEY = "ai_meeting_user";

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const token = authStorage.getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
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

    if (response.status === 401) {
      // Auth expired or invalid
      // Don't auto-clear if it was a login attempt failure
      if (!endpoint.includes("/auth/login")) {
        authStorage.clear();
      }
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
  // Authentication endpoints
  auth: {
    signup: async (data: SignupData): Promise<AuthResponse> => {
      const res = await request<AuthResponse>("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res?.token) {
        authStorage.setToken(res.token);
        if (res.user) authStorage.setUser(res.user);
      }
      return res;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
      const res = await request<AuthResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res?.token) {
        authStorage.setToken(res.token);
        if (res.user) authStorage.setUser(res.user);
      }
      return res;
    },

    getCurrentUser: async (): Promise<User> => {
      const user = await request<User>("/users/me");
      authStorage.setUser(user);
      return user;
    },

    logout: (): void => {
      authStorage.clear();
    },
  },

  // User Profile endpoints
  user: {
    updateProfile: async (data: UpdateProfileData): Promise<User> => {
      const updated = await request<User>("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      authStorage.setUser(updated);
      return updated;
    },

    changePassword: (data: ChangePasswordData): Promise<{ message: string }> => {
      return request<{ message: string }>("/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
  },

  // Meeting endpoints
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

      const token = authStorage.getToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

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
          if (xhr.status === 401) {
            authStorage.clear();
          }
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
