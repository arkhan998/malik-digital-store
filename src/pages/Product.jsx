import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pkr } from '../lib/format';
import { useCart } from '../lib/cart';
import { useToast } from '../lib/toast';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

const WHATSAPP = '923322964709';

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= Math.round(value) ? 'fill-[#ff7a1a]' : 'fill-white/20'}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [rName, setRName] = useState('');
  const [rRating, setRRating] = useState(5);
  const [rText, setRText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setActiveImg(0);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name,slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (error || !data) {
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(data);
      const [revs, rel] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
        data.category_id
          ? supabase
              .from('products')
              .select('*')
              .eq('is_active', true)
              .eq('category_id', data.category_id)
              .neq('id', data.id)
              .limit(4)
          : Promise.resolve({ data: [] }),
      ]);
      if (revs.data) setReviews(revs.data);
      if (rel.data) setRelated(rel.data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b12]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-6 w-48 animate-pulse rounded bg-[#15151d]" />
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-[#15151d]" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-[#15151d]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#15151d]" />
              <div className="h-10 w-40 animate-pulse rounded bg-[#15151d]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <EmptyState
            title="Product not found"
            message="This product may have been removed or the link is wrong."
            action={<Link to="/shop" className="text-[#ff2e88] font-semibold">← Back to shop</Link>}
          />
        </div>
      </div>
    );
  }

  const images = [product.cover_url, ...(product.preview_urls || [])].filter(Boolean);
  const price = product.sale_price ?? product.price;
  const hasSale = product.sale_price != null && product.sale_price < product.price;

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Assalam-o-Alaikum! I want to order: ${product.title} (${pkr(price)})`
  )}`;

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addItem(product);
    toast('Added to cart', 'success');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rName.trim() || !rText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      name: rName.trim(),
      rating: Number(rRating),
      text: rText.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast('Could not submit your review. Please try again.', 'error');
      return;
    }
    toast('Thanks! Your review was submitted for review.', 'success');
    setRName('');
    setRText('');
    setRRating(5);
  };

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]';

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'included', label: "What's Included" },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100 pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {/* ===== gallery ===== */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151d]">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#ff7a1a]/20 via-[#ff2e88]/20 to-[#8b5cf6]/20">
                  <span className="text-6xl font-extrabold text-white/20">{product.title[0]}</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                      activeImg === i ? 'border-[#ff2e88]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== info ===== */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.categories && (
                <Link
                  to={`/shop?cat=${product.categories.slug}`}
                  className="text-sm text-[#00b4ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] rounded"
                >
                  {product.categories.name}
                </Link>
              )}
              {product.is_new && <Badge>NEW</Badge>}
              {hasSale && <Badge>SALE</Badge>}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white">{product.title}</h1>
            <div className="mt-3 flex items-center gap-2">
              <Stars value={product.rating} />
              <span className="text-sm text-gray-400">
                {Number(product.rating).toFixed(1)} · {product.reviews_count} review
                {product.reviews_count === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">{pkr(price)}</span>
              {hasSale && (
                <span className="text-lg text-gray-500 line-through">{pkr(product.price)}</span>
              )}
            </div>
            {product.short_desc && (
              <p className="mt-4 text-gray-400 leading-relaxed">{product.short_desc}</p>
            )}
            <div className="mt-6 hidden md:flex flex-col gap-3">
              <button
                onClick={handleBuyNow}
                className="rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#ff2e88]/25 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
              >
                Buy Now
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                >
                  Add to Cart
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff]"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#15151d] p-4 text-sm text-gray-400">
              <p>✓ Instant digital delivery after payment verification</p>
              <p className="mt-1">✓ Pay with JazzCash or Easypaisa</p>
              <p className="mt-1">✓ Re-download anytime from your account</p>
            </div>
          </div>
        </div>

        {/* ===== tabs ===== */}
        <div className="mt-12">
          <div className="flex gap-2 border-b border-white/10">
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
            {tab === 'description' && (
              <div className="prose-invert max-w-3xl whitespace-pre-line text-gray-300 leading-relaxed">
                {product.full_desc || 'No description available yet.'}
              </div>
            )}
            {tab === 'included' && (
              <div className="max-w-3xl">
                {(product.whats_included || []).length === 0 ? (
                  <p className="text-gray-400">Details coming soon.</p>
                ) : (
                  <ul className="space-y-2">
                    {(product.whats_included || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#00b4ff] text-xs font-bold text-white">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="grid gap-8 lg:grid-cols-2 max-w-5xl">
                <div>
                  <h3 className="font-semibold text-white">Buyer reviews</h3>
                  <div className="mt-4 space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-sm text-gray-400">No reviews yet — be the first!</p>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.id} className="rounded-xl border border-white/10 bg-[#15151d] p-4">
                          <div className="flex items-center justify-between">
                            <Stars value={r.rating} />
                            <span className="text-xs text-gray-500">
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-300">{r.text}</p>
                          <p className="mt-2 text-sm font-semibold text-white">{r.name}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Write a review</h3>
                  <form onSubmit={submitReview} className="mt-4 space-y-3">
                    <input
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      placeholder="Your name"
                      required
                      maxLength={80}
                      className={inputCls}
                    />
                    <select
                      value={rRating}
                      onChange={(e) => setRRating(e.target.value)}
                      aria-label="Rating"
                      className={inputCls}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n === 1 ? '' : 's'}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={rText}
                      onChange={(e) => setRText(e.target.value)}
                      placeholder="What did you think of this product?"
                      required
                      rows={4}
                      maxLength={1000}
                      className={inputCls}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00b4ff] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
                    >
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <p className="text-xs text-gray-500">
                      Reviews appear after approval by our team.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== related ===== */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white">Related Products</h2>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== sticky mobile buy bar ===== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#15151d]/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="text-xl font-extrabold text-white">{pkr(price)}</div>
            {hasSale && <div className="text-xs text-gray-500 line-through">{pkr(product.price)}</div>}
          </div>
          <button
            onClick={handleBuyNow}
            className="flex-1 max-w-[220px] rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-6 py-3 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
