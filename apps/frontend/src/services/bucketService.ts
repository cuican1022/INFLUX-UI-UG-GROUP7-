import { apiClient } from '../api/apiClient'
import { handleError } from '../utils'
import { type Buckets } from '@influxdata/influxdb-client-apis'
import { useAuthStore } from '../stores/auth'

export class BucketService {
  private getAuthToken(): string | null {
    const authStore = useAuthStore()
    return authStore.token
  }

  async getBuckets(): Promise<Buckets> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    try {
      const buckets = await apiClient.get<Buckets>('/buckets', {
        token: token
      })
      
      return buckets
    } catch (error) {
      handleError('Error fetching buckets', error)
      throw error
    }
  }

  async getMeasurements(bucketName: string): Promise<string[]> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    try {
      const response = await apiClient.get<{ measurements: string[] }>(`/buckets/${bucketName}/measurements`, {
        token: token
      })
      
      return response.measurements
    } catch (error) {
      handleError(`Error fetching measurements for bucket "${bucketName}"`, error)
      throw error
    }
  }

  async getFields(bucketName: string, measurement: string): Promise<string[]> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    if (!measurement) {
      throw new Error('Measurement name is required')
    }

    try {
      const response = await apiClient.get<{ fields: string[] }>(`/buckets/${bucketName}/measurements/${measurement}/fields`, {
        token: token
      })
      
      return response.fields
    } catch (error) {
      handleError(`Error fetching fields for measurement "${measurement}" in bucket "${bucketName}"`, error)
      throw error
    }
  }
}

export const bucketService = new BucketService()
