import { Link } from 'react-router-dom'
import { pkr } from '../lib/format.js'
import { useCart } from '../lib/cart.jsx'
import { useToast } from '../lib/toast.jsx'
import { Badge } from './Badge.jsx'

function Stars({ rating }) {
  const value = Math.round(Number(rating) || 0)
  return (
    <span aria-label={`Rated ${value} out of 5`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 ${s <= value ? 'fill-amber-400' : 'fill-slate-700'}`}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  )
}

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const hasSale = product.sale_price != null && Number(product.sale_price) < Number(product.price)

  const handleAdd = () => {
    addItem(product)
    toast(`Added "${product.title}" to cart`, 'success')
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card transition-shadow hover:shadow-lg hover:shadow-purple-500/10">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-bg"
      >
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
            <span className="grad-text text-4xl font-extrabold">M</span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {hasSale && <Badge tone="sale">SALE</Badge>}
          {product.is_new && <Badge tone="new">NEW</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {product.category}
          </span>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors hover:text-slate-200">
            {product.title}
          </h3>
        </Link>
        <Stars rating={product.avg_rating} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white">
              {pkr(hasSale ? product.sale_price : product.price)}
            </span>
            {hasSale && (
              <span className="text-xs text-slate-500 line-through">
                {pkr(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="grad-bg rounded-lg px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}
export default ProductCard;
