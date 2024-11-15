import prisma from '@/lib/db';
import BoardNavbar from './_components/board-navbar';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import LoadingSkeleton from './_components/loading-skeleton';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export default async function Layout({ params, children }: Props) {
  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const board = await prisma.board.findUnique({
    where: {
      id: params.id,
      OR: [
        {
          ownerId: userId,
        },
        {
          invitations: {
            some: {
              status: 'accepted',
              member: {
                userId: userId,
              },
            },
          },
        },
      ],
    },
  });

  if (!board) {
    notFound();
  }

  const bgColor = `bg-${board.color}-500`;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="w-[calc(100%-82px)] md:w-[calc(100%-240px)] h-auto">
        <BoardNavbar board={board} />
        <div className={`${bgColor} w-full h-full px-4 overflow-x-auto`}>
          {children}
        </div>
      </div>
    </Suspense>
  );
}
