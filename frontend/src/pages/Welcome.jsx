/**
 * Welcome.jsx
 * Screen 1 — Introduction and entry point.
 * Shows login/signup buttons when not authenticated.
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'

export default function Welcome() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleGetStarted() {
    if (user) {
      navigate('/study-setup')
    } else {
      navigate('/login')
    }
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
          {!user && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button variant="secondary" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}