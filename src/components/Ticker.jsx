const MESSAGES = [
  'Instant delivery on WhatsApp',
  'JazzCash / Easypaisa accepted',
  'Premium digital products, honest prices',
  'Support on WhatsApp: 0332-2964709',
]

export function Ticker() {
  const row = [...MESSAGES, ...MESSAGES]
  return (
    <div
      aria-hidden="true"
      className="grad-bg overflow-hidden py-1.5 text-xs font-semibold text-white sm:text-sm"
    >
      <div className="ticker-track">
        {row.map((msg, i) => (
          <span key={i} className="mx-6 flex items-center gap-6">
            {msg}
            <span aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
