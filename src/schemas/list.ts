import { z } from 'zod';
import { CardSchema } from './card';

export const createListSchema = z.object({
  title: z.string({ message: 'Title is required' }).min(1, {
    message: "Title shouldn't be empty",
  }),
  boardId: z.string(),
});

export const getAllListsSchema = z.object({
  boardId: z.string(),
});

export const updateListTitleSchema = z.object({
  title: z.string({ message: 'Title is required' }).min(1, {
    message: "Title shouldn't be empty",
  }),
  id: z.string(),
});

export const updateListOrderSchema = z.object({
  lists: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
      cards: z.array(
        z.object({
          id: z.string(),
          position: z.number(),
          listId: z.string(),
        })
      ),
    })
  ),
  boardId: z.string(),
});

export const deleteListSchema = z.object({
  listId: z.string(),
  boardId: z.string(),
});
