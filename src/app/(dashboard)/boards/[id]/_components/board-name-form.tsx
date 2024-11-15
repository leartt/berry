'use client';

import { updateBoardName } from '@/actions/board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Board } from '@prisma/client';
import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
import { ElementRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const BoardNameForm = ({ board }: { board: Board }) => {
  const inputRef = useRef<ElementRef<'input'>>(null);
  const formRef = useRef<ElementRef<'form'>>(null);

  const { execute, optimisticState } = useOptimisticAction(updateBoardName, {
    currentState: { board },
    updateFn(state, input) {
      return {
        board: {
          ...state.board,
          name: input.name,
        },
      };
    },
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
      setIsEditing(false);
    },
    onError: ({ error }) => {
      if (error.validationErrors?.name) {
        toast(error.validationErrors?.name?.[0], { type: 'error' });
        return;
      }
      toast('Error while updating the name', { type: 'error' });
    },
    onExecute: () => {
      setIsEditing(false);
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name') as string;

    if (name.trim() === board.name) {
      setIsEditing(false);
      return;
    }
    execute({ name, id: board.id });
  };

  const handleOnBlur = () => {
    // requestSubmit() => will check for validation on the form first and submit if valid
    if (!inputRef.current?.disabled) {
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  return isEditing ? (
    <form action={handleSubmit} ref={formRef}>
      <Input
        type="text"
        name="name"
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsEditing(false);
          }

          if (e.key === 'Enter') {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        defaultValue={optimisticState.board.name}
        className="text-primary font-medium px-4 max-w-fit w-full"
        onBlur={handleOnBlur}
      />
    </form>
  ) : (
    <Button
      onClick={() => {
        setIsEditing(true);
      }}
      variant="ghost"
      className="px-4"
    >
      {optimisticState.board.name}
    </Button>
  );
};

export default BoardNameForm;
