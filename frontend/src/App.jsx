import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import StudySetup from './pages/StudySetup.jsx'
import WorkSetup from './pages/WorkSetup.jsx'
import Home from './pages/Home.jsx'
import CheckShift from './pages/CheckShift.jsx'
import Result from './pages/Result.jsx'
import Confirmation from './pages/Confirmation.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/study-setup" element={<StudySetup />} />
      <Route path="/work-setup" element={<WorkSetup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/check-shift" element={<CheckShift />} />
      <Route path="/result" element={<Result />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}