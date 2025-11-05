import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Fetch user profile
      axios.get('/api/auth/profile/')
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/token/', { email, password })
    const { access, refresh } = response.data
    localStorage.setItem('token', access)
    localStorage.setItem('refresh', refresh)
    setToken(access)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
    
    const userResponse = await axios.get('/api/auth/profile/')
    setUser(userResponse.data)
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await axios.post('/api/auth/register/', {
      username,
      email,
      password,
      password2: password,
    })
    const { access, refresh } = response.data
    localStorage.setItem('token', access)
    localStorage.setItem('refresh', refresh)
    setToken(access)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(response.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

