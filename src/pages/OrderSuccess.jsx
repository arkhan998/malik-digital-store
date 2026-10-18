import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useAuth } from '../lib/auth';
import Breadcrumbs from '../components/Breadcrumbs';

const WHATSAPP = '923322964709';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  // Order row comes from the checkout insert response (RLS-safe for guests).
  const [order, setOrder] = useState(location.state?.order ?? null);

  // Logged-in users can re-fetch their own order (RLS allows own reads).
  useEffect(() => {
    if (order || authLoading || !user) return;
    (async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      if (data) setOrder(data);
    })();
  }, [order, authLoading, user, id]);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Order Success' }]} />
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#15151d] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#00b4ff] to-[#8b5cf6] shadow-lg shadow-[#00b4ff]/30">
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-white">Order placed successfully!</h1>
          <p className="mt-3 text-gray-400">
            Screenshot received — we'll verify your payment within a few hours and your
            downloads will unlock in your account.
          </p>

          {order ? (
            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-white/10 bg-[#0b0b12] p-5 text-left text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Order ID</span>
                <span className="font-bold text-white">#{order.id}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Total</span>
                <span className="font-bold text-white">{pkr(order.total)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Payment method</span>
                <span className="font-semibold text-white">{order.payment_method}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold text-[#ff7a1a]">Pending verification</span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-500">
              Keep your order ID from the confirmation — message us on WhatsApp if you need help.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/track${id ? `?id=${id}` : ''}`}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-8 py-3 font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              Track Order
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                `Assalam-o-Alaikum! I just placed order #${id}. Please confirm.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-8 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff]"
            >
              WhatsApp Us
            </a>
          </div>
          <Link
            to="/shop"
            className="mt-5 inline-block text-sm text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
