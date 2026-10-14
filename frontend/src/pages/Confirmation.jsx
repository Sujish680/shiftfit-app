/**
 * Confirmation.jsx
 * Screen 7 — Shift added confirmation with updated work shift list.
 *
 * Redirects to /home if accessed without navigation state (no shift was added).
 */

import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import SummaryCard from '../components/SummaryCard.jsx'

export default function Confirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useData()

  const state = location.state
  if (!state?.addedShift) {
    return <Navigate to="/home" replace />
  }

  const { addedShift } = state
  const message = 'Your shift at ' + addedShift.employer +
    ' on ' + formatDate(addedShift.date) +
    ' (' + formatTime(addedShift.startTime) + '\u2013' + formatTime(addedShift.endTime) +
    ') has been added.'

  return (
    <section className="screen active">
      <div className="container">
        <h2>Shift Added</h2>

        <SummaryCard>
          <p className="confirm-message">{message}</p>
        </SummaryCard>

        <SummaryCard title="Updated Work Shifts">
          <ul className="summary-list">
            {data.workShifts.length === 0 ? (
              <li className="empty">No work shifts</li>
            ) : (
              data.workShifts.map(shift => (
                <li key={shift.id}>
                  {shift.employer} — {formatDate(shift.date)} {formatTime(shift.startTime)}–{formatTime(shift.endTime)}
                </li>
              ))
            )}
          </ul>
        </SummaryCard>

        <Button variant="primary" full onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </div>
    </section>
  )
}