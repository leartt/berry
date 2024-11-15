'use server';

import db from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import { auth } from '@clerk/nextjs/server';
import AuthorizationError from '@/lib/AuthorizationError';
import { flattenValidationErrors } from 'next-safe-action';

import {
  createBoardSchema,
  deleteBoardSchema,
  updateBoardNameSchema,
} from '@/schemas';
import { revalidatePath } from 'next/cache';
import { BOARD_CREATION_LIMIT } from '@/lib/constants';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllBoards = actionClient.action(async () => {
  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const boards = await db.board.findMany({
    where: {
      ownerId: userId,
    },
  });

  return boards;
});

export const createBoard = actionClient
  .schema(createBoardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { name, color } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const boardCount = await db.board.count({
      where: {
        ownerId: userId,
      },
    });

    if (boardCount >= BOARD_CREATION_LIMIT) {
      throw new Error('You have reached the maximum number of boards.');
    }

    const board = await db.board.create({
      data: {
        name,
        color,
        ownerId: userId,
      },
    });

    revalidatePath('/boards');
    return {
      board,
      message: 'Your board has been created.',
    };
  });

export const updateBoardName = actionClient
  .schema(updateBoardNameSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { name, id } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const updatedBoard = await db.board.update({
      where: {
        ownerId: userId,
        id,
      },
      data: {
        name,
      },
    });

    revalidatePath(`boards/${id}`);
    return {
      board: updatedBoard,
      message: 'Your board has been updated.',
    };
  });

export const deleteBoard = actionClient
  .schema(deleteBoardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    await db.board.delete({
      where: {
        id,
        ownerId: userId,
      },
    });

    revalidatePath(`boards/${id}`);

    return {
      message: 'Your board has been deleted.',
    };
  });
