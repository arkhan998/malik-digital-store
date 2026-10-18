const ITEMS = [
  {
    title: 'Instant Delivery',
    text: 'Get your download link on WhatsApp right after your order is confirmed.',
    icon: (
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    ),
  },
  {
    title: 'Secure Payment',
    text: 'Pay safely with JazzCash or Easypaisa — verified by our team.',
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    ),
  },
  {
    title: '24/7 Support',
    text: 'Questions? Message us on WhatsApp anytime at 0332-2964709.',
    icon: (
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 20l1.1-5.3A8.5 8.5 0 1 1 21 11.5z" />
    ),
  },
  {
    title: 'Refund Policy',
    text: 'Not delivered or wrong product? Fair refunds, no hassle.',
    icon: (
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
    ),
  },
]

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-card p-5"
          >
            <div className="grad-bg mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
export default TrustStrip;
