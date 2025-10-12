import { apiClient } from '../api/apiClient'
import { handleError } from '../utils'
import { useAuthStore } from '../stores/auth'

export interface CreateDashboardRequest {
  fluxQuery: string
  title: string
  panelTitle?: string
}

export interface CreateDashboardResponse {
  success: boolean
  dashboard: {
    uid: string
    url: string
    absoluteUrl: string
  }
  message: string
}

export interface Datasource {
  id: number
  uid: string
  name: string
  type: string
}

export interface GetDatasourcesResponse {
  message: string
  datasources: Datasource[]
}

export class GrafanaService {
  private getAuthToken(): string | null {
    const authStore = useAuthStore()
    return authStore.token
  }

  async createDashboard(request: CreateDashboardRequest): Promise<CreateDashboardResponse> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    if (!request.fluxQuery) {
      throw new Error('Flux query is required')
    }

    if (!request.title) {
      throw new Error('Dashboard title is required')
    }

    try {
      const response = await apiClient.post<CreateDashboardResponse>('/grafana/dashboard', request, {
        token: token
      })
      
      return response
    } catch (error) {
      handleError('Error creating Grafana dashboard', error)
      throw error
    }
  }

  async getDatasources(): Promise<GetDatasourcesResponse> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    try {
      const response = await apiClient.get<GetDatasourcesResponse>('/grafana/datasources', {
        token: token
      })
      
      return response
    } catch (error) {
      handleError('Error fetching Grafana datasources', error)
      throw error
    }
  }
}

export const grafanaService = new GrafanaService()
