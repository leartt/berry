'use client';

import { createCard } from '@/actions/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardWithMembers, ListWithCard } from '@/lib/types';
import { Card, List } from '@prisma/client';
import { PlusIcon, XIcon } from 'lucide-react';
import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
import {
  Dispatch,
  ElementRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';

interface Props {
  list: ListWithCard;
  setOrderedList: Dispatch<SetStateAction<ListWithCard>>;
}

export default function CardForm({ list, setOrderedList }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<'form'>>(null);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);
  const buttonRef = useRef<ElementRef<'button'>>(null);

  useOnClickOutside(formRef, () => setIsEditing(false));

  useEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    formRef
  );

  const { execute } = useAction(createCard, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
      setIsEditing(false);
    },
    onError: ({ error }) => {
      if (error.validationErrors?.title) {
        toast(error.validationErrors?.title?.[0], { type: 'error' });
        return;
      }
      toast('Error while creating the card', { type: 'error' });
    },
  });

  const handleAddCard = (formData: FormData) => {
    const title = formData.get('title') as string;

    if (!title) {
      toast('Card title is required', { type: 'error' });
      return;
    }

    setIsEditing(false);
    const listId = list.id;
    const boardId = list.boardId;

    setOrderedList({
      ...list,
      cards: [
        ...list.cards,
        {
          id: uuid(),
          title,
          listId,
          description: '',
          createdAt: new Date(),
          dueDate: null,
          updatedAt: new Date(),
          position: list.cards.length + 1,
          assignedTo: [],
          list,
        },
      ],
    });

    // Delay the server request slightly to allow React to update the UI
    setTimeout(() => {
      execute({ title, listId, boardId });
    }, 55);
  };

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div className="mt-2">
      {isEditing ? (
        <form ref={formRef} action={handleAddCard}>
          <Textarea
            ref={textareaRef}
            name="title"
            className="resize-none rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm shadow-slate-500/35"
            placeholder="Enter a name for this card"
          />
          <div className="flex items-center mt-2 gap-1">
            <Button size="sm" type="submit">
              Add card
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              size="sm"
              type="button"
              variant="ghost"
              className="hover:bg-slate-300"
            >
              <XIcon size={18} />
            </Button>
          </div>
        </form>
      ) : (
        <Button
          ref={buttonRef}
          className="flex justify-start gap-2 px-2 w-full rounded-md hover:bg-slate-200 text-sm font-normal"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <PlusIcon size={18} />
          Add a card
        </Button>
      )}
    </div>
  );
}
