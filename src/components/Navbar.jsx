import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { useAuth } from '../lib/auth.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/track', label: 'Track Order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none ${
    isActive
      ? 'text-white'
      : 'text-slate-300 hover:text-white'
  }`

export function Navbar() {
  const { count } = useCart()
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight focus-visible:outline-none"
        >
          <span className="grad-text">MALIK</span>
          <span className="ml-2 hidden text-sm font-semibold text-slate-400 sm:inline">
            Digital Store
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative rounded-md p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
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
            {count > 0 && (
              <span className="grad-bg absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <Link
            to={user ? '/account' : '/login'}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white sm:block"
          >
            {user ? 'Account' : 'Login'}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="rounded-md p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-bg px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                Admin
              </NavLink>
            )}
            <Link
              to={user ? '/account' : '/login'}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white"
            >
              {user ? 'Account' : 'Login'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
