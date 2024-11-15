'use client';
import ListForm from './list-form';
import {
  CardWithMembers,
  CardWithMembersWithList,
  ListWithCard,
} from '@/lib/types';
import ListItem from './list-item';
import { useEffect, useRef, useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { useDebounceCallback } from 'usehooks-ts';
import { getAllLists, updateListOrder } from '@/actions/list';
import { toast } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import CardItem from './card-item';
import { Card, List } from '@prisma/client';

import supabase from '@/lib/supabase';
import { updateCardsOrder } from '@/actions/card';
import DndContextProvider from '@/app/providers/DndContextProvider';
import { list } from 'postcss';

interface Props {
  lists: ListWithCard[];
}

export default function ListContainer({ lists }: Props) {
  const params = useParams<{ id: string }>();
  const [orderedLists, setOrderedLists] = useState(lists);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const router = useRouter();

  const refreshDebounced = useDebounceCallback(router.refresh, 1000);

  const { execute: executeUpdateListsOrder } = useAction(updateListOrder, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
    },
    onError: ({ error }) => {
      if (error.validationErrors?.lists) {
        toast(error?.validationErrors?.lists[0], { type: 'error' });
        return;
      }
      toast('Error while reordering lists', { type: 'error' });
    },
  });

  const { execute: executeUpdateCardsOrder } = useAction(updateCardsOrder, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
    },
    onError: ({ error }) => {
      if (error.validationErrors?.cards) {
        toast(error?.validationErrors?.cards[0], { type: 'error' });
        return;
      }
      toast('Error while reordering cards', { type: 'error' });
    },
  });

  const executeUpdateListsOrderDebounced = useDebounceCallback(
    executeUpdateListsOrder,
    1000
  );
  const executeUpdateCardsOrderDebounced = useDebounceCallback(
    executeUpdateCardsOrder,
    1000
  );

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type === 'list' ? 'list' : 'card';
    const generatedId = `${type}$${event.active.id}`;
    setActiveId(generatedId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!active || !over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Handling reordering lists
    if (activeType === 'list' && overType === 'list') {
      const activeListIndex = orderedLists.findIndex(
        (list) => list.id === active.id
      );
      const overListIndex = orderedLists.findIndex(
        (list) => list.id === over.id
      );

      if (
        activeListIndex !== -1 &&
        overListIndex !== -1 &&
        activeListIndex !== overListIndex
      ) {
        const newLists = [...orderedLists];
        const [movedList] = newLists.splice(activeListIndex, 1);
        newLists.splice(overListIndex, 0, movedList);

        // Reassign positions for lists
        newLists.forEach((list, index) => {
          list.position = index;
        });

        setOrderedLists(newLists);
        executeUpdateListsOrderDebounced({
          lists: newLists,
          boardId: params!.id,
        });
      }
    }

    if (activeType === 'card' && overType === 'card') {
      const activeCard = active.data.current?.card as Card;
      const overCard = over.data.current?.card as Card;

      if (activeCard && overCard) {
        const activeListIndex = orderedLists.findIndex(
          (list) => list.id === activeCard.listId
        );
        const overListIndex = orderedLists.findIndex(
          (list) => list.id === overCard.listId
        );

        const activeCardIndex = orderedLists[activeListIndex].cards.findIndex(
          (card) => card.id === active.id
        );
        const overCardIndex = orderedLists[overListIndex].cards.findIndex(
          (card) => card.id === over.id
        );

        const newLists = [...orderedLists];

        // If cards are in the same list
        if (activeCard.listId === overCard.listId) {
          const listCards = orderedLists[activeListIndex].cards;

          const newCards = [...listCards];
          const [movedCard] = newCards.splice(activeCardIndex, 1);
          newCards.splice(overCardIndex, 0, movedCard);

          // Reassign positions for cards
          newCards.forEach((card, index) => {
            card.position = index;
          });

          newLists[activeListIndex].cards = newCards;
          setOrderedLists(newLists);
          executeUpdateCardsOrderDebounced({
            cards: newCards,
            boardId: params!.id,
          });
        } else {
          // Moving card to another list
          const [movedCard] = newLists[activeListIndex].cards.splice(
            activeCardIndex,
            1
          );
          movedCard.listId = overCard.listId;
          newLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);

          // Reassign positions for cards in both lists
          newLists[activeListIndex].cards.forEach((card, index) => {
            card.position = index;
          });
          newLists[overListIndex].cards.forEach((card, index) => {
            card.position = index;
          });

          setOrderedLists(newLists);
          executeUpdateCardsOrderDebounced({
            cards: newLists[overListIndex].cards,
            boardId: params!.id,
          });
        }
      }
    }

    // Handling moving cards between different lists
    if (activeType === 'card' && overType === 'list') {
      const activeCard = active.data.current?.card as Card;
      const overList = orderedLists.find((list) => list.id === over.id);

      if (activeCard && overList) {
        const activeListIndex = orderedLists.findIndex(
          (list) => list.id === activeCard.listId
        );
        const overListIndex = orderedLists.findIndex(
          (list) => list.id === over.id
        );

        const activeCardIndex = orderedLists[activeListIndex].cards.findIndex(
          (card) => card.id === active.id
        );

        const newLists = [...orderedLists];

        // Remove card from its current list
        const [movedCard] = newLists[activeListIndex].cards.splice(
          activeCardIndex,
          1
        );

        // Add card to the new list
        movedCard.listId = over.id as string;
        newLists[overListIndex].cards.push(movedCard);

        // Reassign positions for cards in both lists
        newLists[activeListIndex].cards.forEach((card, index) => {
          card.position = index;
        });

        newLists[overListIndex].cards.forEach((card, index) => {
          card.position = index;
        });

        setOrderedLists(newLists);
        executeUpdateCardsOrderDebounced({
          cards: newLists[overListIndex].cards,
          boardId: params!.id,
        });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!active || !over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'card' && overType === 'card') {
      const activeCard = active.data.current?.card as Card;
      const overCard = over.data.current?.card as Card;

      if (activeCard && overCard) {
        const activeListIndex = orderedLists.findIndex(
          (list) => list.id === activeCard.listId
        );
        const overListIndex = orderedLists.findIndex(
          (list) => list.id === overCard.listId
        );

        const activeCardIndex = orderedLists[activeListIndex].cards.findIndex(
          (card) => card.id === active.id
        );
        const overCardIndex = orderedLists[overListIndex].cards.findIndex(
          (card) => card.id === over.id
        );

        const newLists = [...orderedLists];

        // If cards are in the same list
        if (activeCard.listId === overCard.listId) {
          const listCards = orderedLists[activeListIndex].cards;

          const newCards = [...listCards];
          const [movedCard] = newCards.splice(activeCardIndex, 1);
          newCards.splice(overCardIndex, 0, movedCard);

          // Reassign positions for cards
          newCards.forEach((card, index) => {
            card.position = index;
          });

          newLists[activeListIndex].cards = newCards;
        } else {
          // Moving card to another list
          const [movedCard] = newLists[activeListIndex].cards.splice(
            activeCardIndex,
            1
          );
          movedCard.listId = overCard.listId;
          newLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);

          // Reassign positions for cards in both lists
          newLists[activeListIndex].cards.forEach((card, index) => {
            card.position = index;
          });
          newLists[overListIndex].cards.forEach((card, index) => {
            card.position = index;
          });
        }

        setOrderedLists(newLists);
      }
    }

    // Handling moving cards between different lists
    if (activeType === 'card' && overType === 'list') {
      const activeCard = active.data.current?.card as Card;
      const overList = orderedLists.find((list) => list.id === over.id);

      if (activeCard && overList) {
        const activeListIndex = orderedLists.findIndex(
          (list) => list.id === activeCard.listId
        );
        const overListIndex = orderedLists.findIndex(
          (list) => list.id === over.id
        );

        const activeCardIndex = orderedLists[activeListIndex].cards.findIndex(
          (card) => card.id === active.id
        );

        const newLists = [...orderedLists];

        // Remove card from its current list
        const [movedCard] = newLists[activeListIndex].cards.splice(
          activeCardIndex,
          1
        );

        // Add card to the new list
        movedCard.listId = over.id as string;
        newLists[overListIndex].cards.push(movedCard);

        // Reassign positions for cards in both lists
        newLists[activeListIndex].cards.forEach((card, index) => {
          card.position = index;
        });

        newLists[overListIndex].cards.forEach((card, index) => {
          card.position = index;
        });

        setOrderedLists(newLists);
      }
    }
  };

  useEffect(() => {
    setOrderedLists(lists);
  }, [lists]);

  console.log('orderedList', orderedLists);

  useEffect(() => {
    const realTimeChannel = supabase
      .channel('list_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'List',
          filter: `boardId=eq.${params!.id}`,
        },
        (payload) => {
          // new changes received from realtime db
          // need to debounce to avoid multiple re-renders
          refreshDebounced();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Card',
        },
        (payload) => {
          // new changes received from realtime db
          // need to debounce to avoid multiple re-renders
          refreshDebounced();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Card',
        },
        (payload) => {
          // new changes received from realtime db
          // need to debounce to avoid multiple re-renders
          refreshDebounced();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: '_CardToMember',
        },
        (payload) => {
          refreshDebounced();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realTimeChannel);
    };
  }, []);

  return (
    <DndContextProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <SortableContext
        items={orderedLists.map((list) => ({ id: list.id }))}
        strategy={rectSortingStrategy}
      >
        <ol className="flex gap-4 py-4 h-full list-none">
          {orderedLists.map((list) => (
            <ListItem key={list.id} list={list} />
          ))}
          <div className="pr-4">
            <ListForm setOrderedLists={setOrderedLists} />
          </div>
        </ol>
      </SortableContext>
      <DragOverlay adjustScale={false}>
        {activeId && activeId.toString().includes('list') && (
          <ListItem
            list={
              orderedLists.find(
                (list) => list.id === activeId?.toString().split('$')[1]
              ) as ListWithCard
            }
          />
        )}
        {activeId && activeId.toString().includes('card') && (
          <CardItem
            card={
              orderedLists
                .map((list) => list.cards)
                .flat()
                .find(
                  (card) => card.id === activeId?.toString().split('$')[1]
                ) as CardWithMembersWithList
            }
          />
        )}
      </DragOverlay>
    </DndContextProvider>
  );
}
