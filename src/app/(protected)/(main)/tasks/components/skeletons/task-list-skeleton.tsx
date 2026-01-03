import { Skeleton } from '@/components/ui/skeleton';

export const TaskListSkeleton = () => (
  <div className="my-4 space-y-4">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-6 rounded-md" />
        </div>
        <div className="space-y-3 pl-6">
          {Array.from({ length: 2 }).map((_, j) => (
            <div key={j} className="flex items-start gap-3 border-b pb-3">
              <Skeleton className="mt-0.5 size-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
