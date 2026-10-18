import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Breadcrumbs from '../components/Breadcrumbs';

const PAGE_SIZE = 12;

const priceOf = (p) => p.sale_price ?? p.price;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const catSlug = searchParams.get('cat') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(slug,name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      if (prods.data) setProducts(prods.data);
      if (cats.data) setCategories(cats.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, catSlug, minPrice, maxPrice, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (catSlug && p.categories?.slug !== catSlug) return false;
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const inTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inTags) return false;
      }
      const price = priceOf(p);
      if (minPrice !== '' && price < Number(minPrice)) return false;
      if (maxPrice !== '' && price > Number(maxPrice)) return false;
      return true;
    });
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
  }, [products, query, catSlug, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setCat = (slug) => {
    if (slug) setSearchParams({ cat: slug });
    else setSearchParams({});
  };

  const inputCls =
    'rounded-xl border border-white/10 bg-[#0b0b12] px-3 py-2.5 text-sm text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]';

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
        <h1 className="mt-2 text-3xl font-extrabold text-white">Shop</h1>
        <p className="mt-1 text-sm text-gray-400">All digital products in one place.</p>

        {/* ===== filters ===== */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#15151d] p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or tags…"
              aria-label="Search products"
              className={inputCls}
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Rs"
                aria-label="Minimum price"
                className={`${inputCls} w-full`}
              />
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Rs"
                aria-label="Maximum price"
                className={`${inputCls} w-full`}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className={inputCls}
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="rating">Top rated</option>
            </select>
            <div className="flex items-center text-sm text-gray-400">
              {loading ? 'Loading…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCat('')}
              className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                !catSlug
                  ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white font-semibold'
                  : 'border border-white/15 text-gray-300 hover:bg-white/5'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.slug)}
                className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] ${
                  catSlug === c.slug
                    ? 'bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] text-white font-semibold'
                    : 'border border-white/15 text-gray-300 hover:bg-white/5'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* ===== grid ===== */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!loading && filtered.length === 0 && (
          <EmptyState
            title="No products found"
            message="Try a different search, category, or price range."
          />
        )}

        {/* ===== pagination ===== */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
