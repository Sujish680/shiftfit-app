/**
 * Welcome.jsx
 * Screen 1 — Introduction and "Get Started" entry point.
 * Includes an M1 development-preview notice so the in-memory-only
 * storage is clearly communicated to the user.
 */

import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

export default function Welcome() {
  const navigate = useNavigate()

  function handleGetStarted() {
    navigate('/study-setup')
  }

  return (
    <section className="screen active">
      <div className="container">
        <div className="welcome-content">
          <h1>ShiftFit</h1>
          <p className="tagline">Does this shift fit around your study?</p>
          <Button variant="primary" onClick={handleGetStarted}>
            Get Started
          </Button>
          <NoticeAlert
            variant="warning"
            title="Development preview"
            description="Data is stored in memory for this session only and resets on refresh. Persistent storage arrives in a later milestone."
          />
        </div>
      </div>
    </section>
  )
}