import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import CardActionsList from './card-actions-list';
import AssignedMembersAvatar from './assigned-members-avatar';
import {
  differenceInHours,
  format,
  formatDistanceToNow,
  getHours,
} from 'date-fns';

import {
  ElementRef,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CardWithMembers, CardWithMembersWithList } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  useDebounceCallback,
  useEventListener,
  useOnClickOutside,
} from 'usehooks-ts';
import { Textarea } from '@/components/ui/textarea';
import { updateCardName } from '@/actions/card';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import DueDateBadge from './due-date-badge';

interface Props {
  card: CardWithMembersWithList;
}

export default function CardItem({ card }: Props) {
  const params = useParams<{ id: string }>();
  const [optimisticCard, setOptimisticCard] = useState(card);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<'form'>>(null);
  const inputRef = useRef<ElementRef<'textarea'>>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: optimisticCard.id,
    data: { type: 'card', card: optimisticCard },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const { execute } = useAction(updateCardName, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
      setIsEditing(false);
    },
    onError: ({ error }) => {
      console.log(error);
      if (error.validationErrors?.title) {
        toast(error.validationErrors?.title?.[0], { type: 'error' });
        return;
      }
      toast('Error while updating the name', { type: 'error' });
      setIsEditing(false);
    },
  });

  const handleUpdateTitle = (formData: FormData) => {
    const title = formData.get('title') as string;
    if (!title) {
      toast('Card title is required', { type: 'error' });
      return;
    }
    if (title.trim() === optimisticCard.title) {
      setIsEditing(false);
      return;
    }

    setOptimisticCard((prev) => ({
      ...prev,
      title,
    }));

    setIsEditing(false);

    // Delay the server request slightly to allow React to update the UI
    setTimeout(() => {
      execute({ id: optimisticCard.id, title, boardId: params.id });
    }, 55);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }

    if (e.altKey || e.ctrlKey || e.shiftKey) return;

    if (e.key === 'Escape') {
      setIsEditing(false);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useOnClickOutside(
    inputRef,
    () => {
      setIsEditing(false);
    },
    'mouseup'
  );

  useEffect(() => {
    setOptimisticCard(card);
  }, [card]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('list-none', isDragging && 'opacity-60')}
    >
      {isEditing ? (
        <form ref={formRef} action={handleUpdateTitle}>
          <Textarea
            ref={inputRef}
            name="title"
            onKeyDown={handleKeyDown}
            defaultValue={optimisticCard.title}
            className="relative group w-full min-h-[100px] py-2 h-full px-3 flex flex-col text-sm bg-white rounded-lg border border-input shadow-sm shadow-slate-500/35 resize-none whitespace-pre-wrap break-all"
          />
        </form>
      ) : (
        <div className="group relative w-full min-h-fit py-2 h-full px-3 flex flex-col text-sm bg-white rounded-lg border border-input shadow-sm shadow-slate-500/35 break-all whitespace-pre-wrap">
          <div
            role="textbox"
            className="cursor-text"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            {optimisticCard.title}
          </div>

          <CardActionsList
            optimisticCard={optimisticCard}
            setOptimisticCard={setOptimisticCard}
          />

          <div className="flex justify-between pt-2">
            <DueDateBadge optimisticCard={optimisticCard} />

            <Suspense fallback={'loading members avatar...'}>
              <AssignedMembersAvatar members={optimisticCard.assignedTo} />
            </Suspense>
          </div>
        </div>
      )}
    </li>
  );
}
