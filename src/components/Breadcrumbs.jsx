import { Link } from 'react-router-dom'

export function Breadcrumbs({ trail = [] }) {
  if (trail.length === 0) return null
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-slate-600">
                  /
                </span>
              )}
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-slate-200">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
export default Breadcrumbs;
