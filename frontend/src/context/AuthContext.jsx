/**
 * AuthContext.jsx
 * Authentication state management using Supabase Auth via FastAPI backend.
 * Stores access_token in localStorage (professor's coursework approach).
 * Never stores passwords or secret keys.
 */

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('shiftfit_token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verify stored token on mount
  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      return
    }
    verifyToken()
  }, [])

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        // Token invalid/expired - clear auth state
        clearAuthState()
      }
      // Network or server errors - keep token, might be temporary
    } catch (err) {
      // Network error - don't clear token, could be temporary
      console.error('Token verification failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearAuthState = () => {
    localStorage.removeItem('shiftfit_token')
    setAccessToken(null)
    setUser(null)
    setError(null)
  }

  const signup = async (email, password) => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        setError(data.detail)
        return { success: false, message: data.detail }
      }
    } catch (err) {
      const msg = 'Network error. Please try again.'
      setError(msg)
      return { success: false, message: msg }
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        localStorage.setItem('shiftfit_token', data.access_token)
        setAccessToken(data.access_token)
        setUser({ user_id: data.user_id, email })
        return { success: true }
      } else {
        setError(data.detail)
        return { success: false, message: data.detail }
      }
    } catch (err) {
      const msg = 'Network error. Please try again.'
      setError(msg)
      return { success: false, message: msg }
    }
  }

  const logout = () => {
    clearAuthState()
  }

  return (
    <AuthContext.Provider value={{
      user, accessToken, loading, error,
      signup, login, logout, setError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}