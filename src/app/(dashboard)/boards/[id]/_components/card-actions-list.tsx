'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Bot, ChartBar, Pencil, Trash, UserPlus2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

import { CardWithMembersWithList } from '@/lib/types';
import { useCardActionsModal } from '@/hooks/useCardActionsModal';

import dynamic from 'next/dynamic';
import modalRegistry from '@/lib/card-actions-modal-registry';
import { createPortal } from 'react-dom';

interface Props {
  optimisticCard: CardWithMembersWithList;
  setOptimisticCard: Dispatch<SetStateAction<CardWithMembersWithList>>;
}

export default function CardActions({
  optimisticCard,
  setOptimisticCard,
}: Props) {
  const [open, setOpen] = useState(false);

  const { isModalOpen, modalType, configureModal, renderModal } =
    useCardActionsModal();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <div
            className={cn(
              'hidden group-hover:block absolute top-1 right-2 z-[5] hover:bg-muted p-[8px] rounded-full',
              open && 'block bg-muted'
            )}
          >
            <Pencil className="w-3 h-3" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[210px] p-2" side="bottom" align="end">
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full justify-start"
            onClick={() => {
              configureModal('ASSIGN_MEMBER');
            }}
          >
            <UserPlus2 className="w-4 h-4 mr-2" />
            Assign member
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full justify-start"
            onClick={() => {
              configureModal('DELETE_CARD');
            }}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Card
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full justify-start"
            onClick={() => {
              configureModal('ASK_AI');
            }}
          >
            <Bot className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full justify-start"
            onClick={() => {
              configureModal('CARD_DETAILS');
            }}
          >
            <ChartBar className="w-4 h-4 mr-2" />
            Details
          </Button>
        </PopoverContent>
      </Popover>
      {isModalOpen ? (
        <>
          {modalType === 'ASSIGN_MEMBER' &&
            renderModal(modalRegistry.ASSIGN_MEMBER, {
              optimisticCard,
              setOptimisticCard,
            })}
          {modalType === 'DELETE_CARD' &&
            renderModal(modalRegistry.DELETE_CARD, {
              cardId: optimisticCard.id,
              setOptimisticCard,
            })}
          {modalType === 'ASK_AI' && renderModal(modalRegistry.ASK_AI)}
          {modalType === 'CARD_DETAILS' &&
            renderModal(modalRegistry.CARD_DETAILS, {
              card: optimisticCard,
              setOptimisticCard,
            })}
        </>
      ) : null}
    </>
  );
}
