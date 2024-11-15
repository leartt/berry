import {
  DndContext,
  DndContextProps,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { MouseSensor, TouchSensor } from './sensors';

export default function DndContextProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & DndContextProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  return (
    <DndContext sensors={sensors} {...props}>
      {children}
    </DndContext>
  );
}
