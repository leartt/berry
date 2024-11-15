'use client';

import { deleteBoard } from '@/actions/board';
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
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'react-toastify';

export default function DeleteBoardButton({ boardId }: { boardId: string }) {
  const { execute } = useAction(deleteBoard, {
    onSuccess: ({ data }) => {
      toast.success(data?.message);
    },
    onError: ({ error }) => {
      toast.error('Error while deleting board');
    },
  });
  const handleDeleteBoard = async (formData: FormData) => {
    const boardId = formData.get('boardId') as string;
    execute({ id: boardId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="absolute top-1 right-1 h-fit p-1"
          variant={'outline'}
        >
          <TrashIcon className="inline-block w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            board and remove all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={handleDeleteBoard}>
            <input
              type="hidden"
              name="boardId"
              value={boardId}
              className="hidden sr-only"
            />
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
