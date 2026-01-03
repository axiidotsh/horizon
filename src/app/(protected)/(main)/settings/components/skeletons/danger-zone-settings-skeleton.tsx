import { Skeleton } from '@/components/ui/skeleton';

export const DangerZoneSettingsSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-96" />
    </div>
    <Skeleton className="h-10 w-36 rounded-lg" />
  </div>
);
