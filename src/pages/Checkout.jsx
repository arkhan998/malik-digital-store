import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useCart } from '../lib/cart';
import { useToast } from '../lib/toast';
import { useAuth } from '../lib/auth';
import { loadStoredCoupon, discountFor } from './Cart';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [methods, setMethods] = useState([]);
  const [methodId, setMethodId] = useState('');
  const [file, setFile] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('id')
      .then(({ data }) => {
        if (data) {
          setMethods(data);
          if (data.length > 0) setMethodId(String(data[0].id));
        }
      });
  }, []);

  // Prefill contact details from profile
  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
    else if (user?.email) setEmail(user.email);
    if (profile?.whatsapp) setWhatsapp(profile.whatsapp);
  }, [profile, user]);

  // Re-validate stored coupon at order time
  useEffect(() => {
    const stored = loadStoredCoupon();
    if (!stored) return;
    (async () => {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', stored.code)
        .eq('is_active', true)
        .single();
      if (!data || (data.expires_at && new Date(data.expires_at) < new Date()) || subtotal < data.min_order) {
        localStorage.removeItem('malik-coupon');
        setCoupon(null);
        toast('Your coupon is no longer valid and was removed.', 'info');
        return;
      }
      setCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value, min_order: data.min_order });
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedMethod = methods.find((m) => String(m.id) === String(methodId));
  const discount = discountFor(coupon, subtotal);
  const total = Math.max(0, subtotal - discount);

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!email.trim() || !whatsapp.trim()) {
      toast('Please enter your email and WhatsApp number.', 'error');
      return;
    }
    if (!selectedMethod) {
      toast('Please choose a payment method.', 'error');
      return;
    }
    if (!file) {
      toast('Please upload your payment screenshot.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // 1. upload screenshot
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `order_${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, file);
      if (upErr) throw new Error('Screenshot upload failed. Please try again.');

      // 2. create order (returns the row — RLS-safe for guests)
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          payment_method: selectedMethod.method,
          payment_screenshot_path: path,
          subtotal,
          discount,
          total,
          coupon_code: coupon?.code ?? null,
          status: 'pending',
        })
        .select()
        .single();
      if (oErr || !order) throw new Error('Could not create your order. Please try again.');

      // 3. order items (one row per cart line; price covers qty)
      const rows = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        price: (i.sale_price ?? i.price) * i.qty,
      }));
      const { error: iErr } = await supabase.from('order_items').insert(rows);
      if (iErr) throw new Error('Order created but items failed. Contact us on WhatsApp with your order details.');

      clear();
      localStorage.removeItem('malik-coupon');
      navigate(`/order-success/${order.id}`, { state: { order } });
    } catch (err) {
      toast(err.message || 'Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]';

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <EmptyState
            title="Your cart is empty"
            message="Add some products before checking out."
            action={
              <Link to="/shop" className="rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3 font-semibold text-white">
                Go to Shop
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
        />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Checkout</h1>

        <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* ===== contact ===== */}
            <div className="rounded-2xl border border-white/10 bg-[#15151d] p-6">
              <h2 className="font-bold text-white">Contact Details</h2>
              <p className="mt-1 text-sm text-gray-400">
                No account needed — we will send your delivery updates here.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  className={inputCls}
                />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp number (e.g. 03321234567)"
                  aria-label="WhatsApp number"
                  className={inputCls}
                />
              </div>
            </div>

            {/* ===== payment method ===== */}
            <div className="rounded-2xl border border-white/10 bg-[#15151d] p-6">
              <h2 className="font-bold text-white">Payment Method</h2>
              {methods.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">
                  Payment methods are being set up. Please contact us on WhatsApp to complete your order.
                </p>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethodId(String(m.id))}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                          String(m.id) === String(methodId)
                            ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white'
                            : 'border border-white/15 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {m.method}
                      </button>
                    ))}
                  </div>
                  {selectedMethod && (
                    <div className="mt-4 rounded-xl border border-[#00b4ff]/30 bg-[#00b4ff]/5 p-4 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-400">Account Title</span>
                        <span className="font-semibold text-white">{selectedMethod.account_title}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-400">Account Number</span>
                        <span className="font-semibold text-white">{selectedMethod.account_number}</span>
                      </div>
                      {selectedMethod.instructions && (
                        <p className="mt-2 text-gray-400">{selectedMethod.instructions}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ===== screenshot upload ===== */}
              <div className="mt-6">
                <label className="font-semibold text-white">Payment Screenshot</label>
                <p className="mt-1 text-sm text-gray-400">
                  Pay the exact total above, then upload a clear screenshot of the transaction.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  aria-label="Payment screenshot"
                  className="mt-3 block w-full text-sm text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-[#8b5cf6] file:to-[#00b4ff] file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:opacity-90 focus-visible:outline-none"
                />
                {file && <p className="mt-2 text-sm text-[#00b4ff]">Selected: {file.name}</p>}
              </div>
            </div>
          </div>

          {/* ===== summary ===== */}
          <div className="h-fit rounded-2xl border border-white/10 bg-[#15151d] p-6">
            <h2 className="font-bold text-white">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-300">
                    {i.title} <span className="text-gray-500">× {i.qty}</span>
                  </span>
                  <span className="font-semibold text-white">{pkr((i.sale_price ?? i.price) * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{pkr(subtotal)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-[#00b4ff]">
                  <span>Coupon ({coupon.code})</span>
                  <span>− {pkr(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total</span>
                <span>{pkr(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || methods.length === 0}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#ff2e88]/25 transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              {submitting ? 'Placing Order…' : `Place Order · ${pkr(total)}`}
            </button>
            <p className="mt-3 text-xs text-gray-500 text-center">
              By placing this order you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-300">Terms</Link> and{' '}
              <Link to="/refund-policy" className="underline hover:text-gray-300">Refund Policy</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
