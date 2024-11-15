import { deleteCard } from '@/actions/card';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardWithMembersWithList, RequiredModalProps } from '@/lib/types';
import { useAction } from 'next-safe-action/hooks';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';

interface Props extends RequiredModalProps {
  cardId: string;
  setOptimisticCard: Dispatch<SetStateAction<CardWithMembersWithList>>;
}

export default function DeleteCardModal({
  isOpen,
  closeModal,
  cardId,
  setOptimisticCard,
}: Props) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!params.id) redirect('/boards');

  const handleDeleteCard = () => {
    // setIsDeleting(true);
    deleteCard({ cardId, boardId: params.id })
      .then(() => {
        router.refresh();
        toast.success('Card deleted');
      })
      .catch((err) => toast.error('Error while deleting card'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] w-full bg-white p-4">
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this card?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <form action={handleDeleteCard}>
            <SubmitButton />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      variant="destructive"
      className="block text-left cursor-pointer py-1 w-full"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
