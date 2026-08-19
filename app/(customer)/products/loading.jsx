import Skeleton, { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-7 w-40" />
      <div className="mt-4 mb-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
