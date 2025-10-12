const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = {
  async get<T>(endpoint: string, options?: { baseURL?: string, token?: string }): Promise<T> {
    const baseURL = options?.baseURL || API_BASE_URL;
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${options?.token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: any, options?: { baseURL?: string, token?: string }): Promise<T> {
    const baseURL = options?.baseURL || API_BASE_URL;
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options?.token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: any, options?: { baseURL?: string, token?: string }): Promise<T> {
    const baseURL = options?.baseURL || API_BASE_URL;
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options?.token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  },

  async delete<T>(endpoint: string, options?: { baseURL?: string, token?: string }): Promise<T> {
    const baseURL = options?.baseURL || API_BASE_URL;
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${options?.token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  },
};
