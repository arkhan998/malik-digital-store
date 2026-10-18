import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

const WHATSAPP = '923322964709';

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(id,title,file_path,cover_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [user]);

  const downloads = orders
    .filter((o) => o.status === 'delivered')
    .flatMap((o) =>
      (o.order_items || []).map((oi) => ({ ...oi, order_id: o.id }))
    );

  const handleDownload = async (item) => {
    const filePath = item.products?.file_path;
    if (!filePath) {
      toast('File not available yet — contact us on WhatsApp.', 'error');
      return;
    }
    setDownloadingId(item.id);
    const { data, error } = await supabase.storage
      .from('product-files')
      .createSignedUrl(filePath, 3600);
    setDownloadingId(null);
    if (error || !data?.signedUrl) {
      toast('Could not create a download link. Please try again.', 'error');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b12]">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="h-10 w-56 animate-pulse rounded bg-[#15151d]" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-[#15151d]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'My Orders' },
    { id: 'downloads', label: `My Downloads (${downloads.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Account' }]} />
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Account</h1>
            <p className="mt-1 text-sm text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6 flex gap-2 border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded-t-lg ${
                tab === t.id
                  ? 'text-white border-b-2 border-[#ff2e88] -mb-px'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#15151d]" />
              ))}
            </div>
          ) : tab === 'orders' ? (
            orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                message="Your orders will appear here once you check out."
                action={
                  <Link to="/shop" className="text-[#ff2e88] font-semibold">
                    Browse the shop →
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-[#15151d] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-white">Order #{o.id}</span>
                        <span className="ml-3 text-sm text-gray-500">
                          {new Date(o.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge>{o.status.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-400">
                      {(o.order_items || []).map((oi) => (
                        <div key={oi.id} className="flex justify-between">
                          <span>{oi.products?.title || 'Product'}</span>
                          <span>{pkr(oi.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-sm text-gray-400">Total</span>
                      <span className="font-bold text-white">{pkr(o.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : downloads.length === 0 ? (
            <EmptyState
              title="No downloads yet"
              message="Once an order is delivered, its files will appear here for instant download."
            />
          ) : (
            <div className="space-y-4">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#15151d] p-4"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#0b0b12]">
                    {item.products?.cover_url ? (
                      <img
                        src={item.products.cover_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff7a1a]/30 to-[#8b5cf6]/30 text-xl font-bold text-white/40">
                        {(item.products?.title || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.products?.title || 'Product'}</p>
                    <p className="text-xs text-gray-500">Order #{item.order_id} · link valid 1 hour</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                      className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00b4ff] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff]"
                    >
                      {downloadingId === item.id ? 'Preparing…' : 'Download'}
                    </button>
                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum! Please send the file for order #${item.order_id} (${item.products?.title}).`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/15 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff]"
                    >
                      Send on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
