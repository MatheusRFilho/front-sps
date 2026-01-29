import axios from 'axios';
import { ApiResponse, Permission } from '../types';
import { getCurrentToken } from '../utils/auth';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

class PermissionService {
  private getAuthHeaders() {
    const token = getCurrentToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async list(): Promise<ApiResponse<Permission[]>> {
    const possibleEndpoints = [
      `${BASE_URL}/users/permissions/list`,
      `${BASE_URL}/permissions/list`,
      `${BASE_URL}/permissions`,
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        
        const response = await axios.get(endpoint, {
          headers: this.getAuthHeaders(),
        });

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status !== 404) {
            throw error;
          }
        }
        
        if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error('Nenhum endpoint de permissões funcionou');
  }
}

const permissionService = new PermissionService();
export default permissionService;