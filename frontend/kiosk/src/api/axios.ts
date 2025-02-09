import axios, { AxiosError } from 'axios'
import { ERROR_MESSAGES } from '../constants'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Retry logic
const retryRequest = async (error: AxiosError, retryCount: number = 0): Promise<any> => {
  const shouldRetry = retryCount < MAX_RETRIES && 
    (!error.response || error.response.status >= 500)

  if (!shouldRetry) {
    return Promise.reject(error)
  }

  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
  
  const config = error.config
  if (!config) {
    return Promise.reject(error)
  }

  return api(config)
    .catch((retryError: AxiosError) => retryRequest(retryError, retryCount + 1))
}

// Request interceptor
api.interceptors.request.use(
  config => {
    // Request timing için header ekle
    config.headers['Request-Time'] = new Date().toISOString()
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => {
    return response
  },
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('Network error:', error)
      return retryRequest(error)
        .catch(() => Promise.reject(new Error(ERROR_MESSAGES.NETWORK)))
    }

    switch (error.response.status) {
      case 400:
        console.error('Bad request:', error.response.data)
        return Promise.reject(new Error(ERROR_MESSAGES.VIRTUAL_TRYON_ERROR))
      case 401:
        console.error('Unauthorized:', error.response.data)
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER))
      case 404:
        console.error('Not found:', error.response.data)
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER))
      case 500:
        console.error('Server error:', error.response.data)
        return retryRequest(error)
          .catch(() => Promise.reject(new Error(ERROR_MESSAGES.SERVER)))
      default:
        console.error('API error:', error.response.data)
        return Promise.reject(new Error(ERROR_MESSAGES.UNEXPECTED_ERROR))
    }
  }
)

export default api
