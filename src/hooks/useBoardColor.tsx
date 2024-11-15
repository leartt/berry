import { useState } from 'react';
import { COLORS } from '@/lib/constants';

const randomIndex = Math.floor(Math.random() * COLORS.length);

const colorClasses = {
  red: 'bg-red-500 ring-red-500',
  orange: 'bg-orange-500 ring-orange-500',
  yellow: 'bg-yellow-500 ring-yellow-500',
  green: 'bg-green-500 ring-green-500',
  blue: 'bg-blue-500 ring-blue-500',
};

export type Color = (typeof COLORS)[number];

const useBoardColor = () => {
  const [randomColor, setRandomColor] = useState<Color>(COLORS[randomIndex]);

  return {
    COLORS,
    randomColor,
    colorClasses,
  };
};

export default useBoardColor;
