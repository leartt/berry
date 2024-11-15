import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function mergeInitials(firstName: string, lastName: string) {
  if (!firstName || !lastName) {
    return '';
  }

  return firstName[0].toUpperCase() + lastName[0].toUpperCase();
}

export function isQuillDescriptionEmpty(description: string) {
  return description.replace(/<(.|\n)*?>/g, '').trim().length === 0;
}

export const tailwindBreakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};
