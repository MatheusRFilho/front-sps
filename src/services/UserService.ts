import axios, { AxiosResponse } from 'axios';
import { User, CreateUserDto, UpdateUserDto, ApiResponse, isAxiosError, PaginationParams, PaginatedResponse } from '../types';
import { getCurrentToken } from '../utils/auth';

export class UserService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  }

  private getAuthHeaders() {
    const token = getCurrentToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async list(params?: PaginationParams): Promise<ApiResponse<User[]> | PaginatedResponse<User>> {
    try {
      let url = `${this.baseURL}/users`;
        
      if (params) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', params.page.toString());
        queryParams.append('limit', params.limit.toString());
        
        if (params.search) {
          queryParams.append('search', params.search);
        }
        
        url += `?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
      });
      
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async get(id: string): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await axios.get(
        `${this.baseURL}/users/${id}`,
        {
          headers: this.getAuthHeaders(),
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

  async getById(id: number): Promise<ApiResponse<User>> {
    return this.get(id.toString());
  }

  async create(data: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await axios.post(
        `${this.baseURL}/users`,
        data,
        {
          headers: this.getAuthHeaders(),
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

  async update(id: string | number, data: UpdateUserDto): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await axios.put(
        `${this.baseURL}/users/${id}`,
        data,
        {
          headers: this.getAuthHeaders(),
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

  async delete(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await axios.delete(
        `${this.baseURL}/users/${id}`,
        {
          headers: this.getAuthHeaders(),
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

export default UserService;
