import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useAuth } from '../lib/auth';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

const STEPS = ['pending', 'verified', 'delivered'];
const STEP_LABELS = { pending: 'Pending', verified: 'Verified', delivered: 'Delivered' };

function statusBadge(status) {
  if (status === 'delivered') return <Badge>DELIVERED</Badge>;
  if (status === 'verified') return <Badge>VERIFIED</Badge>;
  if (status === 'rejected') return <Badge>REJECTED</Badge>;
  return <Badge>PENDING</Badge>;
}

function Timeline({ order }) {
  if (order.status === 'rejected') {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        This order was rejected — your payment could not be verified. Please contact us on
        WhatsApp with your order ID so we can sort it out.
      </div>
    );
  }
  const current = STEPS.indexOf(order.status);
  return (
    <ol className="relative space-y-6 border-l-2 border-white/10 pl-6">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={s} className="relative">
            <span
              className={`absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white'
                  : 'border border-white/20 bg-[#0b0b12] text-gray-500'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <p className={`font-semibold ${active ? 'text-white' : done ? 'text-gray-300' : 'text-gray-500'}`}>
              {STEP_LABELS[s]}
            </p>
            <p className="text-xs text-gray-500">
              {s === 'pending' && 'Order received — awaiting payment verification.'}
              {s === 'verified' && 'Payment verified — preparing your downloads.'}
              {s === 'delivered' && 'Files delivered — check My Downloads in your account.'}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackOrder() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(searchParams.get('id'));

  useEffect(() => {
    setSelectedId(searchParams.get('id'));
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const { data } = await query;
      setOrders(data || []);
      setLoading(false);
    })();
  }, [authLoading, user]);

  const selected = orders.find((o) => String(o.id) === String(selectedId)) || orders[0] || null;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Track Your Order</h1>

        {authLoading || loading ? (
          <div className="mt-8 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#15151d]" />
            ))}
          </div>
        ) : !user ? (
          <div className="mt-8">
            <EmptyState
              title="Log in to track your order"
              message="Order tracking is available for registered accounts. Guest buyers can message us on WhatsApp with their order ID."
              action={
                <Link
                  to="/login"
                  className="rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3 font-semibold text-white"
                >
                  Log In
                </Link>
              }
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No orders yet"
              message="You haven't placed any orders from this account."
              action={
                <Link to="/shop" className="text-[#ff2e88] font-semibold">
                  Browse the shop →
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(String(o.id))}
                  className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                    selected?.id === o.id
                      ? 'border-[#ff2e88]/60 bg-[#15151d]'
                      : 'border-white/10 bg-[#15151d]/60 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">#{o.id}</span>
                    {statusBadge(o.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {new Date(o.created_at).toLocaleDateString()} · {pkr(o.total)}
                  </div>
                </button>
              ))}
            </div>
            <div className="md:col-span-2">
              {selected && (
                <div className="rounded-2xl border border-white/10 bg-[#15151d] p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Order #{selected.id}</h2>
                    {statusBadge(selected.status)}
                  </div>
                  <Timeline order={selected} />
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-[#0b0b12] p-3">
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-white">{pkr(selected.total)}</p>
                    </div>
                    <div className="rounded-xl bg-[#0b0b12] p-3">
                      <p className="text-gray-500">Payment</p>
                      <p className="font-semibold text-white">{selected.payment_method}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
