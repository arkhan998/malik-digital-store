import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'malik-cart'
const CartContext = createContext(null)

function effectivePrice(item) {
  return item.sale_price ?? item.price
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable — cart still works in memory
    }
  }, [items])

  const addItem = (product) => {
    const entry = {
      id: product.id,
      title: product.title,
      price: product.price,
      sale_price: product.sale_price ?? null,
      cover_url: product.cover_url ?? null,
      slug: product.slug,
    }
    setItems((prev) => {
      const found = prev.find((i) => i.id === entry.id)
      if (found) {
        return prev.map((i) =>
          i.id === entry.id ? { ...i, qty: i.qty + 1 } : i,
        )
      }
      return [...prev, { ...entry, qty: 1 }]
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const setQty = (id, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== id)
      return prev.map((i) => (i.id === id ? { ...i, qty } : i))
    })
  }

  const clear = () => setItems([])

  const { subtotal, count } = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + Number(effectivePrice(i) || 0) * i.qty,
      0,
    )
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    return { subtotal, count }
  }, [items])

  const value = { items, addItem, removeItem, setQty, clear, subtotal, count }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
