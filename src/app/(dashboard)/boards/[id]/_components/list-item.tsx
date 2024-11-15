import { ListWithCard } from '@/lib/types';
import ListTitle from './list-title';
import CardForm from './card-form';
import CardItem from './card-item';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface Props {
  list: ListWithCard;
}

export default function ListItem({ list }: Props) {
  const [orderedList, setOrderedList] = useState(list);

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: list.id, data: { type: 'list', list } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  useEffect(() => {
    setOrderedList(list);
  }, [list]);

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'flex-shrink-0 w-[285px] h-full list-none select-none',
        isDragging && 'opacity-60'
      )}
    >
      <div className="w-full rounded-lg min-h-fit py-2 px-2 bg-secondary">
        <div {...listeners}>
          <ListTitle list={orderedList} />
        </div>

        <SortableContext
          items={orderedList.cards?.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col mt-2 gap-2">
            {orderedList.cards?.map((card) => {
              return <CardItem key={card.id} card={card} />;
            })}
          </ol>
        </SortableContext>

        <CardForm list={orderedList} setOrderedList={setOrderedList} />
      </div>
    </li>
  );
}
