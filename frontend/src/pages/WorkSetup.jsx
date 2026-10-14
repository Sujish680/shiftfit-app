/**
 * WorkSetup.jsx
 * Screen 3 — Add existing work shifts.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'

export default function WorkSetup() {
  const navigate = useNavigate()
  const { data, addWorkShift, removeItem } = useData()

  const [employer, setEmployer] = useState('')
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  function handleAddWork(e) {
    e.preventDefault()
    if (employer && date && start && end) {
      addWorkShift(employer.trim(), date, start, end)
      setEmployer('')
      setDate('')
      setStart('')
      setEnd('')
    }
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Work Setup</h2>

        <FormCard title="Add a Work Shift">
          <form onSubmit={handleAddWork}>
            <label>
              Employer
              <input type="text" placeholder="e.g. Campus Cafe" required
                value={employer} onChange={e => setEmployer(e.target.value)} />
            </label>
            <label>
              Date
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
            </label>
            <div className="form-row">
              <label>
                Start Time
                <input type="time" required value={start} onChange={e => setStart(e.target.value)} />
              </label>
              <label>
                End Time
                <input type="time" required value={end} onChange={e => setEnd(e.target.value)} />
              </label>
            </div>
            <Button type="submit" variant="primary">Add Shift</Button>
          </form>
          <ul className="item-list">
            {data.workShifts.map(shift => (
              <li key={shift.id}>
                <span>{shift.employer} — {formatDate(shift.date)} {formatTime(shift.startTime)}–{formatTime(shift.endTime)}</span>
                <button onClick={() => removeItem('workShifts', shift.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </FormCard>

        <Button variant="primary" full onClick={() => navigate('/home')}>
          Next
        </Button>
      </div>
    </section>
  )
}