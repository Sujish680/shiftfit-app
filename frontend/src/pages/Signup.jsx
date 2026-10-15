/**
 * Signup.jsx
 * User registration page using Supabase Auth via FastAPI.
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await signup(email, password)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message)
    } else {
      setError(result.message)
    }
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Sign Up</h2>

        {success && (
          <NoticeAlert variant="success" title="Account Created" description={success} />
        )}

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
              <input type="password" placeholder="At least 6 characters" required
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </label>
            <Button type="submit" variant="primary" full disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </FormCard>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </section>
  )
}