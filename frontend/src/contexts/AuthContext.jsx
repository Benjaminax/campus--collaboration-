import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {},
  isLoading: false,
  isAuthenticated: false
})

export { AuthContext }

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check for token in both localStorage and sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await api.get('/auth/me')
        
        // Handle response structure: { success, data: { user } }
        if (response.data.success) {
          setUser(response.data.data.user)
        } else {
          throw new Error('Invalid token')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Clear both storage types on auth failure
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('rememberMe')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      console.log('🚀 Starting login attempt for:', credentials.email)
      console.log('🌐 API Base URL:', api.defaults.baseURL)
      
      const response = await api.post('/auth/login', credentials)
      
      console.log('✅ Login response received:', response.data)
      
      // Handle the response structure from backend: { success, message, data: { user, token } }
      if (response.data.success) {
        const { token, user } = response.data.data
        
        console.log('🔑 Token received:', token ? token.substring(0, 20) + '...' : 'No token')
        console.log('👤 User received:', user ? user.name : 'No user')
        
        // Handle Remember Me functionality
        if (credentials.remember) {
          // Store in localStorage for persistent login
          localStorage.setItem('token', token)
          localStorage.setItem('rememberMe', 'true')
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem('token', token)
          localStorage.removeItem('rememberMe')
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        toast.success(`Welcome back, ${user.name}!`)
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('📊 Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      })
      
      let message = 'Login failed'
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Network error: Cannot connect to server. Please check if the backend is running.'
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/register', userData)
      
      // Handle the response structure from backend: { success, message, data: { user, token } }
      if (response.data.success) {
        const { token, user } = response.data.data
        
        // For registration, always use persistent storage
        localStorage.setItem('token', token)
        localStorage.setItem('rememberMe', 'true')
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        toast.success(`Welcome to Campus Collaboration, ${user.name}!`)
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear both storage types
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        isLoading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}