import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import BoardCard from './_components/board-card';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { revalidatePath } from 'next/cache';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import DeleteBoardButton from './_components/delete-board-button';

export default async function BoardsPage() {
  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const boards = await db.board.findMany({
    include: {
      invitations: {
        include: {
          member: true,
        },
      },
    },
    where: {
      OR: [
        {
          ownerId: userId,
        },
        {
          invitations: {
            some: {
              member: {
                userId: userId,
              },
              status: 'accepted',
            },
          },
        },
      ],
    },
  });

  return (
    <section className="h-full w-full py-8 px-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-primary text-xl font-bold">My active boards</h1>
        <p className="text-muted-foreground text-sm">
          Choose one of your boards below or create a new one
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 py-4">
          {boards?.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}

          <Link href="/boards/create">
            <BoardCard.New>
              <h2 className="text-primary">Create New Board</h2>
            </BoardCard.New>
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-primary text-xl font-bold">My own boards</h1>
        {/* <p className="text-muted-foreground text-sm">
            Choose one of your boards below or create a new one
          </p> */}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 py-4">
          {boards
            ?.filter((board) => board.ownerId === userId)
            .map((board) => (
              <div key={board.id} className="relative">
                <BoardCard key={board.id} board={board} />

                <DeleteBoardButton boardId={board.id} />
              </div>
            ))}

          <Link href="/boards/create">
            <BoardCard.New>
              <h2 className="text-primary">Create New Board</h2>
            </BoardCard.New>
          </Link>
        </div>
      </div>
    </section>
  );
}
