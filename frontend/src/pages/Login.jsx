/**
 * Login.jsx
 * User login page using Supabase Auth via FastAPI.
 * Redirects to Home on success.
 */

import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/home'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Log In</h2>

        {error && (
          <NoticeAlert variant="destructive" title="Error" description={error} />
        )}

        <FormCard>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" placeholder="you@example.com" required
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </label>
            <label>
              Password
              <input type="password" placeholder="Your password" required
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </label>
            <Button type="submit" variant="primary" full disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </FormCard>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </section>
  )
}