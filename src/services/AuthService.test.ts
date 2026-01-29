import axios from 'axios';
import { AuthService } from './AuthService';
import { LoginDto } from '../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const originalEnv = process.env;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      REACT_APP_SERVER_URL: 'http://localhost:3001'
    };
    
    authService = new AuthService();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          data: {
            token: 'mock-token',
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
          success: true,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed login', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toEqual(mockError);
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      mockedAxios.get.mockResolvedValue({ data: { valid: true } });

      const result = await authService.validateToken('valid-token');

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3001/auth/validate',
        {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }
      );
    });

    it('should return false for invalid token', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.validateToken('invalid-token');

      expect(result).toBe(false);
    });
  });
});
