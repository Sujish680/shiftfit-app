/**
 * WorkSetup.jsx
 * Screen 3 — Add existing work shifts. Now uses async API calls.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

export default function WorkSetup() {
  const navigate = useNavigate()
  const { data, loading, error, addWorkShift, removeItem } = useData()
  const [employer, setEmployer] = useState('')
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAddWork(e) {
    e.preventDefault()
    if (employer && date && start && end) {
      setSaving(true)
      const success = await addWorkShift(employer.trim(), date, start, end)
      setSaving(false)
      if (success) { setEmployer(''); setDate(''); setStart(''); setEnd('') }
    }
  }

  if (loading) {
    return (
      <section className="screen active">
        <div className="container"><h2>Work Setup</h2><p>Loading your data...</p></div>
      </section>
    )
  }

  return (
    <section className="screen active">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Work Setup</h2>
          <Button variant="secondary" onClick={() => navigate('/home')}>Home</Button>
        </div>
        {error && <NoticeAlert variant="destructive" title="Error" description={error} />}
        <FormCard title="Add a Work Shift">
          <form onSubmit={handleAddWork}>
            <label>Employer<input type="text" placeholder="e.g. Campus Cafe" required value={employer} onChange={e => setEmployer(e.target.value)} disabled={saving} /></label>
            <label>Date<input type="date" required value={date} onChange={e => setDate(e.target.value)} disabled={saving} /></label>
            <div className="form-row">
              <label>Start Time<input type="time" required value={start} onChange={e => setStart(e.target.value)} disabled={saving} /></label>
              <label>End Time<input type="time" required value={end} onChange={e => setEnd(e.target.value)} disabled={saving} /></label>
            </div>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Adding...' : 'Add Shift'}</Button>
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
        <Button variant="primary" full onClick={() => navigate('/home')}>Next</Button>
      </div>
    </section>
  )
}