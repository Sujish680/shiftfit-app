/**
 * api.js
 * API helper with authentication token management.
 * Uses VITE_API_BASE_URL from environment.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function authenticatedFetch(endpoint, options = {}) {
  const token = localStorage.getItem('shiftfit_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  // Handle 401 - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('shiftfit_token')
    // Let caller handle redirect
    throw new Response(null, { status: 401 })
  }

  return response
}