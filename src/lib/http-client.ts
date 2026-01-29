import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../config';
import { getCurrentToken, setCurrentToken } from '../utils/auth';
import { toastUtils } from '../utils/toastUtils';
import { HTTP_STATUS } from '../constants';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  enableLogging?: boolean;
  enableToastErrors?: boolean;
}

export class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;

  constructor(clientConfig: HttpClientConfig = {}) {
    this.config = {
      baseURL: config.get('API_BASE_URL'),
      timeout: config.get('API_TIMEOUT'),
      enableLogging: config.get('ENABLE_LOGGING'),
      enableToastErrors: true,
      ...clientConfig,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (requestConfig) => {
        const token = getCurrentToken();
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        return requestConfig;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    const status = error.response?.status;
    const message = this.extractErrorMessage(error);

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        this.handleUnauthorized();
        break;
      case HTTP_STATUS.FORBIDDEN:
        if (this.config.enableToastErrors) {
          toastUtils.accessDenied();
        }
        break;
      case HTTP_STATUS.NOT_FOUND:
        if (this.config.enableToastErrors) {
          toastUtils.resourceNotFound();
        }
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        if (this.config.enableToastErrors) {
          toastUtils.serverError();
        }
        break;
      default:
        if (this.config.enableToastErrors && status && status >= 400) {
          if (message) {
            toastUtils.error('toast.unexpectedError', message);
          } else {
            toastUtils.unexpectedError();
          }
        }
    }
  }

  private handleUnauthorized(): void {
    setCurrentToken(null);
    
    if (this.config.enableToastErrors) {
      toastUtils.sessionExpired();
    }

    if (window.location.pathname !== '/signin') {
      window.location.href = '/signin';
    }
  }

  private extractErrorMessage(error: AxiosError): string {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message) return error.message;
    
    return 'Erro desconhecido';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  setDefaultHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}

export const httpClient = new HttpClient();