import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const TOKEN_STORAGE_KEY = 'pictoriya_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // FormData needs the browser-generated multipart boundary — never force JSON.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  } else if (!config.headers.get('Content-Type')) {
    config.headers.set('Content-Type', 'application/json')
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(error.config?.headers?.Authorization)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      useAuthStore.getState().logout()
      if (
        hadToken &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
