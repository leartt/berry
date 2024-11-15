'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardWithMembersWithList, RequiredModalProps } from '@/lib/types';
import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  SquareKanban,
} from 'lucide-react';
import TextEditor from './rich-text-editor';
import React, {
  Dispatch,
  ElementRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { updateCardDescription, updateCardDueDate } from '@/actions/card';
import { toast } from 'react-toastify';
import { cn, isQuillDescriptionEmpty } from '@/lib/utils';

import DateTimePicker from '@/components/date-time-picker';

interface Props extends RequiredModalProps {
  card: CardWithMembersWithList;
  setOptimisticCard: Dispatch<SetStateAction<CardWithMembersWithList>>;
}

export default function CardDetails({
  isOpen,
  closeModal,
  card,
  setOptimisticCard,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const contentHTMLref = useRef<ElementRef<'div'>>(null);
  const params = useParams<{ id: string }>();
  const [description, setDescription] = useState<string>(
    card.description ?? ''
  );

  const [date, setDate] = useState<Date | undefined>(card.dueDate || undefined);

  const updateDueDate = () => {
    if (date) {
      setOptimisticCard((prev) => ({
        ...prev,
        dueDate: date,
      }));
      updateCardDueDate({ id: card.id, boardId: params.id, date });
    }
  };

  const handleRemoveDueDate = () => {
    setOptimisticCard((prev) => ({
      ...prev,
      dueDate: null,
    }));
    updateCardDueDate({ id: card.id, boardId: params.id, date: null });
    setDate(undefined);
  };

  const { execute } = useAction(updateCardDescription, {
    onSuccess: () => {
      toast.success('Card description updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update card description');
    },
  });

  const handleSubmit = () => {
    setOptimisticCard((prev) => ({
      ...prev,
      description,
    }));

    setIsEditing(false);
    setTimeout(() => {
      execute({
        id: card.id,
        boardId: params.id,
        description,
      });
    }, 55);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isEditing) {
      timeoutId = setTimeout(() => {
        contentHTMLref.current &&
          setIsOverflowing(contentHTMLref.current.scrollHeight > 160);
      }, 55);
    }
    return () => clearTimeout(timeoutId);
  }, [isEditing]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        // prevent card from being dragged
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
        className="sm:max-w-[625px] w-full bg-white"
      >
        <div className="space-y-6">
          <DialogHeader className="text-left">
            <div>
              <div className="flex space-x-2">
                <SquareKanban className="w-6 h-6" />
                <DialogTitle className="font-bold">{card.title}</DialogTitle>
              </div>
              <div className="ml-8">
                <p className="text-sm text-muted-foreground">
                  in list{' '}
                  <span className="font-bold px-2 bg-muted rounded">
                    {card.list.title}
                  </span>
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col">
            <div className="flex space-x-2">
              <Clock className="w-6 h-6" />
              <h2 className="font-bold">Due Date</h2>
            </div>

            <div className="flex gap-2">
              <DateTimePicker
                date={date}
                setDate={setDate}
                className="ml-8 flex-1"
              />
              {date && (
                <>
                  <Button
                    variant="outline"
                    className="w-min"
                    type="submit"
                    onClick={updateDueDate}
                    disabled={!date}
                  >
                    Save
                  </Button>
                  {card.dueDate && (
                    <Button
                      variant="outline"
                      className="w-min"
                      onClick={handleRemoveDueDate}
                      disabled={!date}
                    >
                      Remove
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex space-x-2">
              <AlignLeft className="w-6 h-6" />
              <h2 className="font-bold">Description</h2>
            </div>
            {isEditing ? (
              <form action={handleSubmit} className="ml-8">
                <TextEditor
                  description={description}
                  setDescription={setDescription}
                />
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                >
                  Close
                </Button>
              </form>
            ) : isQuillDescriptionEmpty(description) ? (
              <div className="ml-8">
                <Button
                  variant="secondary"
                  className="block w-full text-left pb-16"
                  onClick={() => setIsEditing(true)}
                >
                  Add a detailed description
                </Button>
              </div>
            ) : (
              <div>
                <div
                  className={cn(
                    'relative overflow-hidden ml-8',
                    isExpanded
                      ? 'max-h-[190px] md:max-h-[290px] overflow-scroll cursor-pointer'
                      : 'max-h-32 md:max-h-48'
                  )}
                >
                  <div
                    ref={contentHTMLref}
                    className={cn(
                      'prose prose-sm prose-li:marker:text-primary'
                    )}
                    onClick={() => {
                      !isExpanded ? setIsExpanded(true) : setIsEditing(true);
                    }}
                    dangerouslySetInnerHTML={{ __html: description ?? '' }}
                  ></div>
                  {!isExpanded && isOverflowing && (
                    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                {isOverflowing && (
                  <Button
                    className="transition-none w-full"
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="outline"
                  >
                    {isExpanded ? (
                      <span className="flex items-center gap-[2px]">
                        <ChevronUp className="w-6 h-6 font-extrabold" />
                        Show less{' '}
                      </span>
                    ) : (
                      <span className="flex items-center gap-[2px]">
                        <ChevronDown className="w-6 h-6 font-extrabold" />
                        Show more{' '}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
