/**
 * FormCard.jsx
 * Reusable form card wrapper — React equivalent of the Assessment 2 <sf-form-card>.
 *
 * Props:
 *   title    — optional heading text rendered as <h3>
 *   children — form content
 */

export default function FormCard({ title, children }) {
  return (
    <div className="form-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}