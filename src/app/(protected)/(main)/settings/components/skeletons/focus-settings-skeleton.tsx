import { Skeleton } from '@/components/ui/skeleton';

export const FocusSettingsSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="max-w-xs space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);
