import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useToast } from '../lib/toast';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import TrustStrip from '../components/TrustStrip';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import EmptyState from '../components/EmptyState';

const WHATSAPP_URL = 'https://wa.me/923322964709';

const FAQS = [
  {
    q: 'How do I receive my product after payment?',
    a: 'Place your order, pay with JazzCash or Easypaisa to the account shown at checkout, and upload your payment screenshot. We verify it (usually within a few hours), then your download appears under Account → My Downloads. Everything is digital — no shipping, no waiting for a courier.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'JazzCash and Easypaisa. At checkout you will see the exact account title, number, and payment instructions. Pay the exact order total and upload a clear screenshot of the transaction.',
  },
  {
    q: 'I ordered as a guest. How do I get my files?',
    a: 'Create an account with the same email you used at checkout, then open Account → My Downloads. Or message us on WhatsApp with your order ID and we will send the file directly.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Because these are digital products, refunds are issued only if the file is broken or corrupt and we cannot fix or replace it within 48 hours. Please read the full Refund Policy page before buying.',
  },
  {
    q: 'Are the files mine forever?',
    a: 'Yes. Once your order is delivered, it stays in your account and you can re-download it anytime.',
  },
];

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? 'fill-[#ff7a1a]' : 'fill-white/20'}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [cats, featured, fresh, revs] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(4),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_new', true)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('reviews')
          .select('*, products(title)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);
      if (cats.data) setCategories(cats.data);
      if (featured.data) setBestSellers(featured.data);
      if (fresh.data) setNewArrivals(fresh.data);
      if (revs.data) setReviews(revs.data);
      setLoading(false);
    })();
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubscribing(true);
    const { error } = await supabase.from('newsletter').insert({ email: trimmed });
    setSubscribing(false);
    if (error) {
      if (error.code === '23505') toast('You are already subscribed!', 'info');
      else toast('Could not subscribe. Please try again.', 'error');
      return;
    }
    toast('Subscribed! Watch your inbox for deals.', 'success');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(600px 300px at 20% 10%, rgba(255,122,26,.35), transparent), radial-gradient(600px 300px at 80% 20%, rgba(0,180,255,.25), transparent), radial-gradient(500px 300px at 50% 90%, rgba(139,92,246,.25), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-[#ff7a1a] via-[#ff2e88] via-[#8b5cf6] to-[#00b4ff] bg-clip-text text-transparent">
                Premium Digital Products,
                <br />
                Honest Prices
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-gray-400">
              Ebooks, prompt packs, templates and more — pay securely with JazzCash or Easypaisa,
              get instant download access. No subscriptions, no hidden fees.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/shop"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#ff2e88]/25 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                Shop Products
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                WhatsApp Us
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustStrip />

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <SectionHead title="Shop by Category" link="/shop" linkText="View all" />
        </Reveal>
        {categories.length === 0 ? (
          <EmptyState title="Categories coming soon" message="We are setting up the store. Check back shortly." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Reveal key={c.id}>
                <Link
                  to={`/shop?cat=${c.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-[#15151d] p-6 text-center transition hover:border-[#ff2e88]/50 hover:shadow-lg hover:shadow-[#ff2e88]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88]"
                >
                  <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br from-[#ff7a1a] via-[#ff2e88] to-[#8b5cf6] opacity-90 transition group-hover:scale-110" />
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  <span className="mt-1 inline-block text-sm text-gray-400 group-hover:text-[#ff2e88]">
                    Browse →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ============ BEST SELLERS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <SectionHead title="Best Sellers" link="/shop" linkText="View all" />
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!loading && bestSellers.length === 0 && (
          <EmptyState title="No best sellers yet" message="Our top picks will appear here soon." />
        )}
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <SectionHead title="New Arrivals" link="/shop" linkText="View all" />
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!loading && newArrivals.length === 0 && (
          <EmptyState title="Nothing new yet" message="Fresh products are on the way." />
        )}
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <SectionHead title="How It Works" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: 1, t: 'Choose', d: 'Browse the store and add the digital products you want to your cart.' },
            { n: 2, t: 'Pay', d: 'Pay with JazzCash or Easypaisa and upload your payment screenshot.' },
            { n: 3, t: 'Get Delivery', d: 'We verify your payment within a few hours and your downloads unlock in your account.' },
          ].map((s) => (
            <Reveal key={s.n}>
              <div className="rounded-2xl border border-white/10 bg-[#15151d] p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-xl font-bold text-white">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-gray-400">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <SectionHead title="What Buyers Say" />
        </Reveal>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#15151d]" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState title="Reviews coming soon" message="Buyer reviews will appear here once they are approved." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {reviews.map((r) => (
              <Reveal key={r.id}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#15151d] p-6">
                  <Stars value={r.rating} />
                  <p className="mt-3 flex-1 text-sm text-gray-300">“{r.text}”</p>
                  <div className="mt-4 text-sm">
                    <p className="font-semibold text-white">{r.name}</p>
                    {r.products?.title && <p className="text-gray-500">on {r.products.title}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Reveal>
          <SectionHead title="Frequently Asked Questions" />
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[#15151d]">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded-2xl"
              >
                {f.q}
                <span className="text-[#ff2e88] text-xl leading-none">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="px-5 pb-5 text-sm text-gray-400">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-[#15151d] p-8 text-center">
            <h2 className="text-2xl font-bold text-white">Get deals in your inbox</h2>
            <p className="mt-2 text-sm text-gray-400">
              New products, discounts and promo codes. No spam — unsubscribe anytime.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00b4ff] px-8 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </Reveal>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <Reveal>
          <div
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{ background: 'linear-gradient(120deg,#ff7a1a,#ff2e88 35%,#8b5cf6 70%,#00b4ff)' }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to level up your content?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Premium digital products at honest prices — pay with JazzCash or Easypaisa and
              download in hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/shop"
                className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 font-bold text-[#0b0b12] transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Start Shopping
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto rounded-xl border-2 border-white/60 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
