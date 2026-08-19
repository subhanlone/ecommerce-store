import Skeleton, { TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <div className="mt-6">
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
}
