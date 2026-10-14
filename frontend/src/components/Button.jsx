/**
 * Button.jsx
 * Reusable button — React equivalent of the Assessment 2 <sf-button> custom element.
 * Renders directly as <button> (no wrapper) matching A2's light-DOM approach.
 *
 * Props:
 *   variant  — "primary" (default) or "secondary"
 *   full     — if true, button is full-width
 *   type     — "button" (default) or "submit"
 *   onClick  — click handler
 */

export default function Button({ variant = 'primary', full = false, type = 'button', onClick, children }) {
  const className = 'btn btn-' + variant + (full ? ' btn-full' : '')
  return (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  )
}