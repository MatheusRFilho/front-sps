import axios, { AxiosResponse } from 'axios';
import { 
  LoginDto, 
  AuthResponse, 
  ApiResponse, 
  isAxiosError,
  AuthRefreshResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from '../types';

export class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw error;
      }
      
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.get(`${this.baseURL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(token: string): Promise<ApiResponse<AuthRefreshResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthRefreshResponse>> = await axios.post(
        `${this.baseURL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw error;
      }
      
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
        `${this.baseURL}/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw error;
      }
      
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    try {
      const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
        `${this.baseURL}/auth/reset-password`,
        { token, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw error;
      }
      
      throw new Error('Erro de conexão com o servidor');
    }
  }
}
