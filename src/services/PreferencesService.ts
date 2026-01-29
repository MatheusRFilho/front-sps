import axios, { AxiosResponse } from 'axios';
import { UpdatePreferencesDto, ApiResponse, isAxiosError } from '../types';
import { getCurrentToken } from '../utils/auth';

export class PreferencesService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  }

  private getAuthHeaders() {
    const token = getCurrentToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async updatePreferences(preferences: UpdatePreferencesDto): Promise<ApiResponse<UpdatePreferencesDto>> {
    try {
      
      const response: AxiosResponse<ApiResponse<UpdatePreferencesDto>> = await axios.put(
        `${this.baseURL}/users/preferences`,
        preferences,
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