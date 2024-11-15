import { COLORS } from '@/lib/constants';
import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string({ message: 'Name is required' }).min(3, {
    message: 'Name should be at least 3 characters long',
  }),
  color: z.enum(COLORS, { required_error: 'You need to select a color' }),
});

export const updateBoardNameSchema = z.object({
  id: z.string(),
  name: z.string({ message: 'Name is required' }).min(3, {
    message: 'Name should be at least 3 characters long',
  }),
});

export const deleteBoardSchema = z.object({
  id: z.string(),
});
