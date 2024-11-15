import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import BoardCard from './board-card';

const BoardSkeleton = () => {
  return (
    <div className="h-full w-full py-12 px-8">
      <div>
        <div className="space-y-2">
          <Skeleton className="w-[100px] h-6"></Skeleton>
          <Skeleton className="w-[200px] h-4"></Skeleton>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 py-4">
          <BoardCard.Skeleton />
        </div>
      </div>
    </div>
  );
};

export default BoardSkeleton;
