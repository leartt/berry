'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, XIcon } from 'lucide-react';
import {
  Dispatch,
  ElementRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import ListWrapper from './list-wrapper';
import { useParams } from 'next/navigation';
import { createList } from '@/actions/list';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'react-toastify';
import { ListWithCard } from '@/lib/types';
import { v4 as uuid } from 'uuid';
interface Props {
  setOrderedLists: Dispatch<SetStateAction<ListWithCard[]>>;
}

export default function ListForm({ setOrderedLists }: Props) {
  const params = useParams<{ id: string }>();

  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<'form'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);

  const { execute, result, status } = useAction(createList, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
      setIsEditing(false);
    },
    onError: ({ error }) => {
      if (error.validationErrors?.title) {
        toast(error.validationErrors?.title?.[0], { type: 'error' });
        return;
      }
      toast('Error while creating the list', { type: 'error' });
    },
  });

  useOnClickOutside(formRef, () => setIsEditing(false));

  const handleEnableEditing = () => {
    setIsEditing(true);
  };

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    const boardId = formData.get('boardId') as string;
    if (!title) {
      toast('List title is required', { type: 'error' });
      return;
    }
    setOrderedLists((prev) => [
      ...prev,
      {
        id: uuid(),
        title,
        boardId,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        position: prev.length + 1,
      },
    ]);

    // Delay the server request slightly to allow React to update the UI
    setTimeout(() => {
      execute({ title, boardId });
    }, 55);
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <ListWrapper>
        <div className="bg-secondary p-4 rounded-md">
          <form action={handleSubmit} ref={formRef} className="space-y-4">
            <Input
              ref={inputRef}
              className="text-sm h-8 rounded"
              type="text"
              name="title"
              placeholder="Enter list name"
              disabled={status === 'executing'}
            />
            <Input type="hidden" name="boardId" defaultValue={params!.id} />

            <div className="flex items-center gap-[5px]">
              <Button
                type="submit"
                className="w-fit"
                disabled={status === 'executing'}
              >
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                type="button"
                variant="ghost"
                className="hover:bg-slate-200"
              >
                <XIcon size={18} />
              </Button>
            </div>
          </form>
        </div>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <Button
        variant="ghost"
        className="flex w-full gap-2 py-6 justify-start bg-secondary/30 hover:bg-secondary/10 text-secondary"
        onClick={handleEnableEditing}
      >
        <Plus size={18} />
        Add a new list
      </Button>
    </ListWrapper>
  );
}
