import axios from 'axios'

// Get API URL from environment variable or use empty string for development (relative paths)
const API_URL = import.meta.env.VITE_API_URL || ''

// Create axios instance with base URL
// If API_URL is empty, axios will use relative paths (works with Vite proxy in dev)
const apiClient = axios.create({
  baseURL: API_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient

