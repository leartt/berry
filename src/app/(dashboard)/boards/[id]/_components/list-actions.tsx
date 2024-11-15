import { deleteList } from '@/actions/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ListWithCard } from '@/lib/types';
import { EllipsisIcon, XIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';

interface Props {
  list: ListWithCard;
}

const ListActions = ({ list }: Props) => {
  const [open, setOpen] = useState(false);

  const { execute } = useAction(deleteList, {
    onSuccess: ({ data }) => {
      // setOpen(false);
      toast(data?.message, { type: 'success' });
    },
    onError: () => {
      toast('Error while deleting the list', { type: 'error' });
    },
  });

  const handleDeleteList = (formData: FormData) => {
    const listId = formData.get('listId') as string;
    const boardId = formData.get('boardId') as string;
    execute({ listId, boardId });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="px-1 mr-2 hover:bg-slate-200 h-fit">
          <EllipsisIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm flex-1 text-center">List Actions</h2>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <XIcon size={14} />
          </Button>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col space-y-2">
          <form action={handleDeleteList}>
            <Input
              hidden
              name="listId"
              className="sr-only"
              defaultValue={list.id}
            />
            <Input
              hidden
              name="boardId"
              className="sr-only"
              defaultValue={list.boardId}
            />
            <SubmitButton />
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      type="submit"
      variant="ghost"
      className="block text-left hover:bg-slate-50 cursor-pointer py-1 w-full"
    >
      Delete
    </Button>
  );
};

export default ListActions;
