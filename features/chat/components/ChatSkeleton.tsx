import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 py-4">
      <div className="flex w-full items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-9/12" />
          <Skeleton className="h-4 w-7/12" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </div>
    </div>
  );
}
