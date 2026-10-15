/**
 * CheckShift.jsx
 * Screen 5 — Enter a proposed shift and see its result.
 *
 * Form is empty when entered from Home; prefilled with the previous proposed
 * shift when navigated back from the Result screen (preserving A2 behaviour).
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { checkShift } from '../lib/checkShift.js'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'

export default function CheckShift() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useData()

  // Prefill from Result's "Go Back" state; empty otherwise
  const prefill = location.state?.prefill || null

  const [employer, setEmployer] = useState(prefill ? prefill.employer : '')
  const [date, setDate] = useState(prefill ? prefill.date : '')
  const [start, setStart] = useState(prefill ? prefill.startTime : '')
  const [end, setEnd] = useState(prefill ? prefill.endTime : '')

  function handleCheck(e) {
    e.preventDefault()
    if (employer && date && start && end) {
      const proposed = {
        employer: employer.trim(),
        date,
        startTime: start,
        endTime: end
      }
      const result = checkShift(proposed, data)
      navigate('/result', { state: { proposed, result } })
    }
  }

  return (
    <section className="screen active">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Check a Shift</h2>
          <Button variant="secondary" onClick={() => navigate('/home')}>Home</Button>
        </div>

        <FormCard>
          <form onSubmit={handleCheck}>
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
            <Button type="submit" variant="primary" full>Check</Button>
          </form>
        </FormCard>

        <Button variant="secondary" full onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </div>
    </section>
  )
}