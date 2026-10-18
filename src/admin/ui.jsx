import { useEffect } from 'react';

// Shared admin UI primitives (self-contained so admin pages don't depend on
// Worker A's component APIs). Dark neon theme matching the build contract.

export const inputCls =
  'w-full bg-[#0b0b12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500';

export function Spinner({ className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-white/15 border-t-orange-500 h-6 w-6 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function CenterLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#15151d] rounded-xl border border-white/10 p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, sub, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {sub && <p className="text-sm text-white/50 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Btn({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white hover:opacity-90',
    ghost: 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25',
    warn: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25',
  }[variant] || '';
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label || 'Toggle'}
      title={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
        checked ? 'bg-orange-500' : 'bg-white/15'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-white/70 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/40 mt-1">{hint}</span>}
    </label>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      className={`text-left text-xs uppercase tracking-wider text-white/50 font-medium px-3 py-2.5 border-b border-white/10 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`px-3 py-2.5 border-b border-white/5 align-middle ${className}`}>{children}</td>;
}

export function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[680px] text-sm text-white">{children}</table>
    </div>
  );
}

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  verified: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        statusStyles[status] || 'bg-white/10 text-white/60 border-white/10'
      }`}
    >
      {status}
    </span>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-[#15151d] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#15151d] pb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtDay(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
