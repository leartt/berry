'use server';

import AuthorizationError from '@/lib/AuthorizationError';
import db from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import {
  createListSchema,
  deleteListSchema,
  getAllListsSchema,
  updateListOrderSchema,
  updateListTitleSchema,
} from '@/schemas';
import { auth } from '@clerk/nextjs/server';
import { flattenValidationErrors } from 'next-safe-action';
import { revalidatePath } from 'next/cache';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllLists = actionClient
  .schema(getAllListsSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { boardId } }) => {
    const { userId, redirectToSignIn } = auth();

    if (!userId) {
      return redirectToSignIn();
    }

    const lists = await db.list.findMany({
      where: {
        boardId: boardId,
      },
      include: {
        cards: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    return lists;
  });

export const createList = actionClient
  .schema(createListSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { title, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const board = await db.board.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    const lastList = await db.list.findFirst({
      where: {
        boardId,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    const newPosition = lastList ? lastList.position + 1 : 0;

    const list = await db.list.create({
      data: {
        title,
        boardId,
        position: newPosition,
      },
    });

    revalidatePath(`/boards/${board.id}`);
    return {
      list,
      message: 'Your list has been created.',
    };
  });

export const updateListTitle = actionClient
  .schema(updateListTitleSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { title, id } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    await sleep(1000);

    const list = await db.list.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });

    if (!list) {
      throw new Error('List not found');
    }

    revalidatePath(`/boards/${list.boardId}`);
    return {
      list,
      message: 'Your list has been updated.',
    };
  });

export const updateListOrder = actionClient
  .schema(updateListOrderSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { lists, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const transaction = lists.map((list) =>
      db.list.update({
        where: {
          id: list.id,
        },
        data: {
          position: list.position,
        },
      })
    );

    const updatedLists = await db.$transaction(transaction);
    if (!updatedLists) {
      throw new Error('Error while reordering lists');
    }

    revalidatePath(`/boards/${boardId}`);
    return {
      updatedLists,
      message: 'Lists has been reordered.',
    };
  });

export const deleteList = actionClient
  .schema(deleteListSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { listId, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const ownerExists = await db.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId,
      },
    });

    const memberExists = await db.invitation.findFirst({
      where: {
        boardId,
        member: {
          userId,
        },
      },
    });

    if (!ownerExists && !memberExists) {
      throw new AuthorizationError('Unauthorized');
    }

    await db.list.delete({
      where: {
        id: listId,
      },
    });

    revalidatePath(`/boards/${boardId}`);
    return {
      message: 'List has been deleted.',
    };
  });
