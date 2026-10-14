/**
 * SummaryCard.jsx
 * Reusable summary card — React equivalent of the Assessment 2 <sf-summary-card>.
 *
 * Props:
 *   title    — optional heading text rendered as <h3>
 *   children — card content
 */

export default function SummaryCard({ title, children }) {
  return (
    <div className="summary-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}