import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '../config/axios'
import { useAuth } from './AuthContext'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  checkAdminStatus: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminStatus = async () => {
    if (!token || !user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    try {
      // Check if user is staff/superuser by trying to access admin endpoint
      // We'll create a simple admin check endpoint
      const response = await apiClient.get('/api/auth/admin-check/')
      setIsAdmin(response.data.is_admin || false)
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [token, user])

  return (
    <AdminContext.Provider value={{ isAdmin, loading, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  )
}

