/**
 * DataContext.jsx
 * M1: In-memory mock data store for ShiftFit.
 *
 * IMPORTANT — This is a temporary placeholder that holds all data in React state.
 * Data is lost on page refresh. Persistent per-user storage (Supabase + FastAPI)
 * will replace this in a later milestone.
 */

import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

const emptyData = {
  classes: [],
  assessments: [],
  studyBlocks: [],
  workShifts: []
}

export function DataProvider({ children }) {
  const [data, setData] = useState(emptyData)

  /**
   * Generate a simple unique ID — mirrors A2's Date.now() approach.
   * Replaced by UUIDs when Supabase is introduced.
   */
  const generateId = () => Date.now()

  const addClass = (name, day, startTime, endTime) => {
    const newItem = { id: generateId(), name, day, startTime, endTime }
    setData(prev => ({ ...prev, classes: [...prev.classes, newItem] }))
  }

  const addAssessment = (name, dueDate) => {
    const newItem = { id: generateId(), name, dueDate }
    setData(prev => ({ ...prev, assessments: [...prev.assessments, newItem] }))
  }

  const addStudyBlock = (day, startTime, endTime) => {
    const newItem = { id: generateId(), day, startTime, endTime }
    setData(prev => ({ ...prev, studyBlocks: [...prev.studyBlocks, newItem] }))
  }

  const addWorkShift = (employer, date, startTime, endTime) => {
    const newItem = { id: generateId(), employer, date, startTime, endTime }
    setData(prev => ({ ...prev, workShifts: [...prev.workShifts, newItem] }))
  }

  const removeItem = (collection, id) => {
    setData(prev => ({
      ...prev,
      [collection]: prev[collection].filter(item => item.id !== id)
    }))
  }

  return (
    <DataContext.Provider value={{
      data, addClass, addAssessment, addStudyBlock, addWorkShift, removeItem
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}