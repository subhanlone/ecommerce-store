/*
  Loading placeholder.

  Every page in this app reads from MongoDB in a server component, so navigation
  previously showed the old route until the query returned — no signal that
  anything was happening. These shapes stand in for the real content at roughly
  the right size, so the layout doesn't jump when the data lands.

  The sweep is a background animation, so the global prefers-reduced-motion rule
  in globals.css stops it without leaving an empty box behind.
*/

export default function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}

/* A product card's silhouette: square image, category line, title, price. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* Table rows keep their real height so the header doesn't shift on swap. */
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex gap-4 border-b border-line bg-surface-muted px-4 py-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
