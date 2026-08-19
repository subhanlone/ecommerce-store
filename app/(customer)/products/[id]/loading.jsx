import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-11 w-48" />
        </div>
      </div>
    </div>
  );
}
