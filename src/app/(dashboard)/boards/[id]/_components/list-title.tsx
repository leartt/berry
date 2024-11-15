'use client';

import { updateListTitle } from '@/actions/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListWithCard } from '@/lib/types';
import { useOptimisticAction } from 'next-safe-action/hooks';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import ListActions from './list-actions';

export default function ListTitle({ list }: { list: ListWithCard }) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<'form'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);

  const { execute, optimisticState, status } = useOptimisticAction(
    updateListTitle,
    {
      currentState: { list },
      updateFn(state, input) {
        return {
          list: {
            ...state.list,
            title: input.title,
          },
        };
      },
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: ({ error }) => {
        if (error.validationErrors?.title) {
          toast(error.validationErrors?.title?.[0], { type: 'error' });
          return;
        }
        toast('Error while updating the title', { type: 'error' });
      },
      onExecute: () => {
        setIsEditing(false);
      },
    }
  );

  const handleUpdateList = (formData: FormData) => {
    const title = formData.get('title') as string;
    if (!title) {
      toast('List title is required', { type: 'error' });
      return;
    }
    if (title.trim() === optimisticState.list.title) {
      setIsEditing(false);
      return;
    }

    execute({ title, id: list.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }

    if (e.key === 'Escape') {
      setIsEditing(false);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useOnClickOutside(formRef, () => setIsEditing(false));
  useEventListener(
    'blur',
    () => {
      setIsEditing(false);
    },
    inputRef
  );

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <form ref={formRef} action={handleUpdateList}>
      <Input
        ref={inputRef}
        name="title"
        onKeyDown={handleKeyDown}
        defaultValue={optimisticState.list.title}
        className="text-sm font-semibold h-[34px] px-2"
      />
    </form>
  ) : (
    <div className="flex h-min justify-between items-center">
      <h2
        className="pl-2 flex flex-grow self-stretch items-center text-primary font-semibold text-sm cursor-pointer"
        role="textbox"
        onClick={() => setIsEditing(true)}
      >
        {optimisticState.list.title}
      </h2>

      <ListActions list={list} />
    </div>
  );
}
