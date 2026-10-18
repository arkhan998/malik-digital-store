import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/track', label: 'Track Order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const POLICIES = [
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold tracking-tight">
            <span className="grad-text">MALIK</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Premium digital products with instant delivery and honest prices.
          </p>
        </div>

        <nav aria-label="Quick links">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Quick Links
          </p>
          <ul className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Policies">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Policies
          </p>
          <ul className="space-y-2">
            {POLICIES.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Contact
          </p>
          <p className="text-sm text-slate-400">WhatsApp Support</p>
          <a
            href="https://wa.me/923322964709"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm font-semibold text-white hover:underline"
          >
            0332-2964709
          </a>
          <p className="mt-2 text-sm text-slate-400">JazzCash / Easypaisa accepted</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} MALIK Digital Store. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
