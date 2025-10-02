import { authService } from '../../services/authService';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should call login API with correct data', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token',
          token_type: 'bearer',
          user: {
            id: 1,
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'admin',
          },
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(axios.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle login API errors', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid credentials',
          },
        },
      };

      axios.post.mockRejectedValue(mockError);

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    test('should call register API with correct data', async () => {
      const mockResponse = {
        data: {
          id: 1,
          email: 'newuser@example.com',
          full_name: 'New User',
          role: 'teacher',
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
        role: 'teacher',
      };

      const result = await authService.register(registerData);

      expect(axios.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle register API errors', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Email already registered',
          },
        },
      };

      axios.post.mockRejectedValue(mockError);

      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Existing User',
        role: 'student',
      };

      await expect(authService.register(registerData)).rejects.toThrow('Email already registered');
    });
  });
});

