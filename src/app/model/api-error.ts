export interface ApiErrorResponse {
  error: ApiError;
  statusCode: number;
}

export interface ApiError {
  code: string;
  message: string;
  error: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorDetail {
  issue: string;
  field: string;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    !!value &&
    typeof value === 'object' &&
    'error' in value &&
    !!value.error &&
    typeof value.error === 'object' &&
    'code' in value.error &&
    typeof value.error.code === 'string' &&
    'message' in value.error &&
    typeof value.error.message === 'string' &&
    'error' in value.error &&
    typeof value.error.error === 'string'
  );
}
