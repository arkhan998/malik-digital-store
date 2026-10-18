const TONES = {
  sale: 'bg-red-600/90 text-white',
  new: 'bg-emerald-600/90 text-white',
  info: 'bg-blue-600/90 text-white',
  sample: 'bg-amber-500/90 text-black',
}

export function Badge({ children, tone = 'info' }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        TONES[tone] ?? TONES.info
      }`}
    >
      {children}
    </span>
  )
}
export default Badge;
