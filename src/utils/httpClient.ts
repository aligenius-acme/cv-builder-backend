import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
  code?: string;
  data?: unknown;
}

/**
 * Create a configured axios instance with standard defaults
 */
export function createHttpClient(config: HttpClientConfig = {}): AxiosInstance {
  const instance = axios.create({
    timeout: config.timeout || 30000,
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    },
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const httpError: HttpError = {
        message: error.message,
        status: error.response?.status,
        code: error.code,
        data: error.response?.data,
      };
      return Promise.reject(httpError);
    }
  );

  return instance;
}

/**
 * Make a GET request with error handling
 */
export async function httpGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = createHttpClient();
  const response = await client.get<T>(url, config);
  return response.data;
}

/**
 * Make a POST request with error handling
 */
export async function httpPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = createHttpClient();
  const response = await client.post<T>(url, data, config);
  return response.data;
}

/**
 * Check if error is an HTTP error
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as HttpError).message === 'string'
  );
}

/**
 * Get a user-friendly error message from an HTTP error
 */
export function getHttpErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (isHttpError(error)) {
    if (error.status === 404) return 'Resource not found';
    if (error.status === 401) return 'Unauthorized';
    if (error.status === 403) return 'Access denied';
    if (error.status === 429) return 'Too many requests. Please try again later.';
    if (error.status && error.status >= 500) return 'Server error. Please try again later.';
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// Pre-configured clients for external services
export const externalClients = {
  /**
   * Create a client for the LanguageTool API
   */
  languageTool: (apiUrl: string) =>
    createHttpClient({
      baseURL: apiUrl,
      timeout: 10000,
    }),

  /**
   * Create a client for the Adzuna Jobs API
   */
  adzuna: (appId: string, appKey: string) =>
    createHttpClient({
      baseURL: 'https://api.adzuna.com/v1/api/jobs',
      timeout: 15000,
      headers: {
        'X-App-Id': appId,
        'X-App-Key': appKey,
      },
    }),

  /**
   * Create a client for OAuth providers
   */
  oauth: (baseURL: string) =>
    createHttpClient({
      baseURL,
      timeout: 10000,
    }),
};
