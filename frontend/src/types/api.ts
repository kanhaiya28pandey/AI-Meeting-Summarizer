export interface ApiError {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiClientError extends Error {
  public status: number;
  public details?: ApiError;

  constructor(message: string, status: number, details?: ApiError) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}
