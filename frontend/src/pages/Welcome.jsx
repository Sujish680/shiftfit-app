/**
 * Welcome.jsx
 * Screen 1 — Introduction and entry point.
 * Redirects to /home if already authenticated.
 * Shows loading during session restoration to prevent button flash.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'

export default function Welcome() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Redirect authenticated users to Home
  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true })
    }
  }, [user, loading, navigate])

  // Show loading while verifying session (prevents button flash)
  if (loading) {
    return (
      <section className="screen active">
        <div className="container">
          <div className="welcome-content">
            <h1>ShiftFit</h1>
            <p className="tagline">Loading...</p>
          </div>
        </div>
      </section>
    )
  }

  // If user is authenticated, don't render (will redirect via useEffect)
  if (user) {
    return null
  }

  function handleGetStarted() {
    navigate('/login')
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
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="secondary" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}