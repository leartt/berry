import db from '@/lib/db';
import ListContainer from './_components/list-container';
import { Suspense } from 'react';
import LoadingSkeleton from './_components/loading-skeleton';

async function BoardIdPage({ params }: { params: { id: string } }) {
  const lists = await db.list.findMany({
    where: {
      boardId: params.id,
    },
    include: {
      cards: {
        orderBy: {
          position: 'asc',
        },
        include: {
          assignedTo: true,
          list: true,
        },
      },
    },
    orderBy: {
      position: 'asc',
    },
  });

  return <ListContainer lists={lists} />;
}

export default BoardIdPage;
