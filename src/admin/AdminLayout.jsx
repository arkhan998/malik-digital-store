import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Spinner } from './ui';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/settings', label: 'Settings' },
];

function linkCls({ isActive }) {
  return `whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
    isActive
      ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white'
      : 'text-white/60 hover:text-white hover:bg-white/5'
  }`;
}

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access denied</h1>
          <p className="text-white/50 text-sm">You do not have permission to view the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar on desktop / horizontal scroll nav on mobile */}
        <aside className="lg:w-60 lg:shrink-0 lg:min-h-screen lg:border-r border-b lg:border-b-0 border-white/10 bg-[#0b0b12] lg:sticky lg:top-0 lg:h-screen">
          <div className="px-4 py-4 lg:py-6">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3 hidden lg:block">
              MALIK Admin
            </p>
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
