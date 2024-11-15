import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-[50px]" />
      <div className="flex gap-4 flex-[0] px-4 py-4">
        <Skeleton className="w-[300px] h-[50px]" />
        <Skeleton className="w-[300px] h-[300px]" />
        <Skeleton className="w-[300px] h-[600px]" />
      </div>
    </div>
  );
}
