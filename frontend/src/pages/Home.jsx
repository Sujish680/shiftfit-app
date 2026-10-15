/**
 * Home.jsx
 * Screen 4 — Summary of all commitments with Logout. Now shows loading state.
 */

import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import SummaryCard from '../components/SummaryCard.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { data, loading, error } = useData()
  const { logout } = useAuth()

  function handleLogout() {
    navigate('/', { replace: true })
    setTimeout(() => logout(), 0)
  }

  if (loading) {
    return (
      <section className="screen active">
        <div className="container">
          <h2>Home</h2>
          <p>Loading your commitments...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Home</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <SummaryCard title="Classes">
          <ul className="summary-list">
            {data.classes.length === 0 ? (
              <li className="empty">No classes added yet</li>
            ) : (
              data.classes.map(cls => (
                <li key={cls.id}>{cls.name} — {cls.day} {formatTime(cls.startTime)}–{formatTime(cls.endTime)}</li>
              ))
            )}
          </ul>
        </SummaryCard>

        <SummaryCard title="Assessments">
          <ul className="summary-list">
            {data.assessments.length === 0 ? (
              <li className="empty">No assessments added yet</li>
            ) : (
              data.assessments.map(a => (
                <li key={a.id}>{a.name} — due {formatDate(a.dueDate)}</li>
              ))
            )}
          </ul>
        </SummaryCard>

        <SummaryCard title="Work Shifts">
          <ul className="summary-list">
            {data.workShifts.length === 0 ? (
              <li className="empty">No work shifts added yet</li>
            ) : (
              data.workShifts.map(shift => (
                <li key={shift.id}>{shift.employer} — {formatDate(shift.date)} {formatTime(shift.startTime)}–{formatTime(shift.endTime)}</li>
              ))
            )}
          </ul>
        </SummaryCard>

        <Button variant="secondary" full onClick={() => navigate('/study-setup')}>
          Edit Study Setup
        </Button>

        <Button variant="secondary" full onClick={() => navigate('/work-setup')}>
          Edit Work Setup
        </Button>

        <Button variant="primary" full onClick={() => navigate('/check-shift')}>
          Check a Shift
        </Button>

        <Button variant="secondary" full onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </section>
  )
}