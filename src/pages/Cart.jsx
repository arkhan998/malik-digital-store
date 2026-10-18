import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useCart } from '../lib/cart';
import { useToast } from '../lib/toast';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';

const COUPON_KEY = 'malik-coupon';

export function loadStoredCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function discountFor(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.discount_type === 'percent') return Math.round((subtotal * coupon.discount_value) / 100);
  return Math.min(coupon.discount_value, subtotal);
}

export default function Cart() {
  const { items, setQty, removeItem, subtotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [checking, setChecking] = useState(false);

  // Re-validate a stored coupon against the current subtotal
  useEffect(() => {
    const stored = loadStoredCoupon();
    if (stored && subtotal < stored.min_order) {
      setCoupon(null);
      localStorage.removeItem(COUPON_KEY);
    } else if (stored) {
      setCoupon(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyCoupon = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setChecking(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', trimmed)
      .eq('is_active', true)
      .single();
    setChecking(false);
    if (error || !data) {
      toast('Invalid or expired coupon code.', 'error');
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast('This coupon has expired.', 'error');
      return;
    }
    if (subtotal < data.min_order) {
      toast(`This coupon needs a minimum order of ${pkr(data.min_order)}.`, 'error');
      return;
    }
    const saved = {
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order: data.min_order,
    };
    setCoupon(saved);
    localStorage.setItem(COUPON_KEY, JSON.stringify(saved));
    setCode('');
    toast(`Coupon ${data.code} applied!`, 'success');
  };

  const removeCoupon = () => {
    setCoupon(null);
    localStorage.removeItem(COUPON_KEY);
    toast('Coupon removed.', 'info');
  };

  const discount = discountFor(coupon, subtotal);
  const total = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <EmptyState
            title="Your cart is empty"
            message="Browse the store and add some digital products."
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
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Your Cart</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ===== items ===== */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.sale_price ?? item.price;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-[#15151d] p-4"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0b0b12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88]"
                  >
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff7a1a]/30 to-[#8b5cf6]/30 text-2xl font-bold text-white/40">
                        {item.title[0]}
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-semibold text-white hover:text-[#ff2e88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] rounded w-fit"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 text-sm text-gray-400">{pkr(price)} each</div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            item.qty > 1 ? setQty(item.id, item.qty - 1) : removeItem(item.id)
                          }
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{pkr(price * item.qty)}</span>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast('Removed from cart.', 'info');
                          }}
                          className="text-sm text-red-400 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== summary ===== */}
          <div className="h-fit rounded-2xl border border-white/10 bg-[#15151d] p-6">
            <h2 className="font-bold text-white">Order Summary</h2>

            {/* coupon */}
            {coupon ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#00b4ff]/40 bg-[#00b4ff]/10 px-4 py-3">
                <div>
                  <div className="font-semibold text-[#00b4ff]">{coupon.code}</div>
                  <div className="text-xs text-gray-400">
                    {coupon.discount_type === 'percent'
                      ? `${coupon.discount_value}% off`
                      : `${pkr(coupon.discount_value)} off`}
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-sm text-red-400 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0b12] px-3 py-2.5 text-sm text-white placeholder-gray-500 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="shrink-0 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                >
                  {checking ? '…' : 'Apply'}
                </button>
              </form>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{pkr(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#00b4ff]">
                  <span>Discount</span>
                  <span>− {pkr(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                <span>Total</span>
                <span>{pkr(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#ff2e88]/25 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
