export function SectionHead({ kicker, title, sub }) {
  return (
    <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
      {kicker && (
        <p className="grad-text mb-2 text-xs font-bold uppercase tracking-[0.2em]">
          {kicker}
        </p>
      )}
      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm text-slate-400">{sub}</p>}
    </div>
  )
}
export default SectionHead;
