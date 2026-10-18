import { Link } from 'react-router-dom'

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-card px-6 py-14 text-center">
      <div className="grad-bg mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-400">{text}</p>}
      {action && (
        <Link
          to={action.to}
          className="grad-bg mt-5 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
export default EmptyState;
