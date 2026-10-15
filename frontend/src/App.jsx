/**
 * App.jsx
 * Route definitions with protected route wrapper.
 * Includes trailing-slash remover to prevent catch-all redirects.
 */

import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Welcome from './pages/Welcome.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import StudySetup from './pages/StudySetup.jsx'
import WorkSetup from './pages/WorkSetup.jsx'
import Home from './pages/Home.jsx'
import CheckShift from './pages/CheckShift.jsx'
import Result from './pages/Result.jsx'
import Confirmation from './pages/Confirmation.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <section className="screen active">
        <div className="container">
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * Removes trailing slashes from URLs to prevent catch-all route matching.
 * Example: /study-setup/ → /study-setup
 */
function RemoveTrailingSlash() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
      navigate(location.pathname.slice(0, -1), { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}

export default function App() {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/study-setup" element={<ProtectedRoute><StudySetup /></ProtectedRoute>} />
        <Route path="/work-setup" element={<ProtectedRoute><WorkSetup /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/check-shift" element={<ProtectedRoute><CheckShift /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}