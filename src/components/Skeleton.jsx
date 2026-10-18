export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/10 bg-card"
    >
      <div className="aspect-[4/3] bg-white/5" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-3 w-1/3 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  )
}
