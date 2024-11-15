import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
  position: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  listId: z.string(),
});

export const createCardSchema = z.object({
  id: z.string().optional(),
  title: z.string({ message: 'Title is required' }).min(1, {
    message: "Title shouldn't be empty",
  }),
  listId: z.string(),
  boardId: z.string(),
});

export const deleteCardSchema = z.object({
  cardId: z.string(),
  boardId: z.string(),
});

export const updateCardNameSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  title: z.string({ message: 'Title is required' }).min(1, {
    message: "Title shouldn't be empty",
  }),
});

export const updateCardDueDateSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  date: z.date().nullable(),
});

export const updateCardDescriptionSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  description: z.string(),
});

export const updateCardOrderSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string(),
      title: z.string({ message: 'Title is required' }).min(1, {
        message: "Title shouldn't be empty",
      }),
      position: z.number(),
      listId: z.string(),
    })
  ),
  boardId: z.string(),
});

export const assignMemberToCardSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
});

export const unassignMemberCardSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
});
