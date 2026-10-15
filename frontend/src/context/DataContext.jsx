/**
 * DataContext.jsx
 * M6: Persistent data store using FastAPI backend.
 * Replaces in-memory mock with authenticated API calls.
 * Session safety: clears data on logout or account change.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)
const emptyData = { classes: [], assessments: [], studyBlocks: [], workShifts: [] }
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function DataProvider({ children }) {
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, accessToken, logout } = useAuth()

  const toCamelCase = (item) => {
    if (!item) return null
    return {
      id: item.id, name: item.name, day: item.day,
      startTime: item.start_time || item.startTime,
      endTime: item.end_time || item.endTime,
      dueDate: item.due_date || item.dueDate,
      employer: item.employer, date: item.date
    }
  }

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    if (response.status === 401) { logout(); throw new Error('Session expired') }
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(err.detail || 'Request failed')
    }
    return response.json()
  }, [accessToken, logout])

  useEffect(() => {
    if (!user || !accessToken) { setData(emptyData); setLoading(false); return }
    loadAllData()
  }, [user, accessToken])

  const loadAllData = async () => {
    setLoading(true); setError(null)
    try {
      const [classes, assessments, studyBlocks, workShifts] = await Promise.all([
        apiFetch('/api/classes'), apiFetch('/api/assessments'),
        apiFetch('/api/study-blocks'), apiFetch('/api/work-shifts')
      ])
      setData({
        classes: classes.map(toCamelCase), assessments: assessments.map(toCamelCase),
        studyBlocks: studyBlocks.map(toCamelCase), workShifts: workShifts.map(toCamelCase)
      })
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) setData(emptyData)
    } finally { setLoading(false) }
  }

  const addClass = async (name, day, startTime, endTime) => {
    try {
      const item = await apiFetch('/api/classes', { method: 'POST', body: JSON.stringify({ name, day, startTime, endTime }) })
      setData(prev => ({ ...prev, classes: [...prev.classes, toCamelCase(item)] }))
      return true
    } catch (err) { return false }
  }

  const addAssessment = async (name, dueDate) => {
    try {
      const item = await apiFetch('/api/assessments', { method: 'POST', body: JSON.stringify({ name, dueDate }) })
      setData(prev => ({ ...prev, assessments: [...prev.assessments, toCamelCase(item)] }))
      return true
    } catch (err) { return false }
  }

  const addStudyBlock = async (day, startTime, endTime) => {
    try {
      const item = await apiFetch('/api/study-blocks', { method: 'POST', body: JSON.stringify({ day, startTime, endTime }) })
      setData(prev => ({ ...prev, studyBlocks: [...prev.studyBlocks, toCamelCase(item)] }))
      return true
    } catch (err) { return false }
  }

  const addWorkShift = async (employer, date, startTime, endTime) => {
    try {
      const item = await apiFetch('/api/work-shifts', { method: 'POST', body: JSON.stringify({ employer, date, startTime, endTime }) })
      setData(prev => ({ ...prev, workShifts: [...prev.workShifts, toCamelCase(item)] }))
      return true
    } catch (err) { return false }
  }

  const removeItem = async (collection, id) => {
    const endpoints = { classes: '/api/classes', assessments: '/api/assessments', studyBlocks: '/api/study-blocks', workShifts: '/api/work-shifts' }
    try {
      await apiFetch(`${endpoints[collection]}/${id}`, { method: 'DELETE' })
      setData(prev => ({ ...prev, [collection]: prev[collection].filter(i => i.id !== id) }))
      return true
    } catch (err) { return false }
  }

  const clearData = useCallback(() => { setData(emptyData); setError(null) }, [])

  return (
    <DataContext.Provider value={{ data, loading, error, addClass, addAssessment, addStudyBlock, addWorkShift, removeItem, refreshData: loadAllData, clearData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}