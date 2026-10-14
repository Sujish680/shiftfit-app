/**
 * Result.jsx
 * Screen 6 — Displays shift verdict (Good Fit / Tight Fit / Conflict),
 * explanation bullets, and actions to add the shift or go back.
 *
 * The checkShift function is a verbatim port of the A2 algorithm; no rules
 * have been changed. Golden-master parity tests are deferred to M2.
 *
 * Redirects to /check-shift if accessed without navigation state.
 */

import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import Button from '../components/Button.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addWorkShift } = useData()

  const state = location.state
  if (!state?.proposed || !state?.result) {
    return <Navigate to="/check-shift" replace />
  }

  const { proposed, result } = state

  const verdictMap = {
    'Good Fit': 'success',
    'Tight Fit': 'warning',
    'Conflict': 'destructive'
  }
  const variant = verdictMap[result.verdict] || 'success'

  function handleAddAnyway() {
    addWorkShift(proposed.employer, proposed.date, proposed.startTime, proposed.endTime)
    navigate('/confirmation', { state: { addedShift: proposed } })
  }

  function handleGoBack() {
    navigate('/check-shift', { state: { prefill: proposed } })
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Shift Result</h2>

        <NoticeAlert variant={variant} title={result.verdict} description={result.summary} />

        <SummaryCard title="Details">
          <p className="result-summary">{result.summary}</p>
          <ul className="result-explanations">
            {result.explanations.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </SummaryCard>

        <div className="result-actions">
          <Button variant="primary" full onClick={handleAddAnyway}>
            Add Shift Anyway
          </Button>
          <Button variant="secondary" full onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </div>
    </section>
  )
}