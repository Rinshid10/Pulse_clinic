export default function FormField({ label, span2, children }) {
  return (
    <div className={`ad-field ${span2 ? 'ad-span2' : ''}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}
