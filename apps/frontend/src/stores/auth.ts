import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '../api/apiClient'
import { toast } from 'vue-sonner'
import { useFluxQueryStore } from './fluxQuery'
import type { LoginResponse } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const organization = ref<string>('')
  const isAuthenticated = ref<boolean>(!!token.value)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && !!token.value)
  
  const authHeaders = computed(() => ({
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }))

  // Actions
  const login = async (apiToken: string, org: string) => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        apiToken: apiToken.trim(),
        organization: org.trim()
      })

      if (response.success) {
        setToken(response.token)
        setOrganization(org.trim())
        return { success: true }
      } else {
        return { success: false, message: response.message || 'Authentication failed' }
      }
    } catch (error: any) {
      let errorMessage = 'Authentication failed'
      
      if (error.message) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.'
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid InfluxDB credentials'
        } else {
          errorMessage = error.message
        }
      }
      
      return { success: false, message: errorMessage }
    }
  }

  const logout = () => {
    token.value = null
    organization.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('authToken')
    localStorage.removeItem('organization')

    const fluxQueryStore = useFluxQueryStore()
    fluxQueryStore.resetSelection()

    toast.info('Logged out successfully')
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    isAuthenticated.value = true
    localStorage.setItem('authToken', newToken)
  }

  const setOrganization = (org: string) => {
    organization.value = org
    localStorage.setItem('organization', org)
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('authToken')
    const storedOrg = localStorage.getItem('organization')
    
    if (storedToken) {
      try {
        // Validate the stored token with the backend
        const response = await apiClient.get<{ valid: boolean; message: string; organization?: string }>('/auth/validate', {
          token: storedToken
        })
        
        if (response.valid) {
          token.value = storedToken
          isAuthenticated.value = true
        } else {
          // Token is invalid, clear
          logout()
          return
        }
      } catch (error) {
        // Token validation failed, clear
        logout()
        return
      }
    }
    
    if (storedOrg && isAuthenticated.value) {
      organization.value = storedOrg
    }
  }

  initializeAuth()

  return {
    // State
    token,
    organization,
    isAuthenticated,
    
    // Getters
    isLoggedIn,
    authHeaders,
    
    // Actions
    login,
    logout,
    setToken,
    setOrganization,
    initializeAuth
  }
})
