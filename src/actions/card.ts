'use server';

import AuthorizationError from '@/lib/AuthorizationError';
import db from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import {
  assignMemberToCardSchema,
  createCardSchema,
  createListSchema,
  deleteCardSchema,
  unassignMemberCardSchema,
  updateCardDescriptionSchema,
  updateCardDueDateSchema,
  updateCardNameSchema,
  updateCardOrderSchema,
  updateListTitleSchema,
} from '@/schemas';
import { auth } from '@clerk/nextjs/server';
import { flattenValidationErrors } from 'next-safe-action';
import { revalidatePath } from 'next/cache';
import DOMPurify from 'isomorphic-dompurify';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createCard = actionClient
  .schema(createCardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id, title, listId, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const totalCards = await db.card.count({
      where: {
        listId,
      },
    });

    const position = totalCards === 0 ? 0 : totalCards + 1;

    const card = await db.card.create({
      data: {
        title,
        listId,
        position,
      },
    });

    if (!card) {
      throw new Error('Card not found');
    }

    // revalidatePath(`/boards/${boardId}`);
    return {
      card,
      message: 'Your card has been created.',
    };
  });

export const deleteCard = actionClient
  .schema(deleteCardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { cardId, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const card = await db.card.delete({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new Error('Card can not be deleted');
    }

    // revalidatePath(`/boards/${boardId}`);
    return {
      card,
      message: 'Card has been deleted.',
    };
  });

export const updateCardName = actionClient
  .schema(updateCardNameSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id, boardId, title } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const board = await db.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        invitations: {
          where: {
            status: 'accepted',
            memberId: userId,
          },
        },
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    const isUserBoardOwner = board.ownerId === userId;
    const isUserABoardMember = board.invitations.length > 0;

    if (!isUserBoardOwner && !isUserABoardMember) {
      throw new AuthorizationError('Unauthorized');
    }

    const card = await db.card.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });

    if (!card) {
      throw new Error('Card not found');
    }

    revalidatePath(`/boards/${boardId}`);
    return {
      card,
      message: 'Your card title has been updated.',
    };
  });

export const updateCardDueDate = actionClient
  .schema(updateCardDueDateSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id, boardId, date } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const board = await db.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        invitations: {
          where: {
            status: 'accepted',
            memberId: userId,
          },
        },
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    const isUserBoardOwner = board.ownerId === userId;
    const isUserABoardMember = board.invitations.length > 0;

    if (!isUserBoardOwner && !isUserABoardMember) {
      throw new AuthorizationError('Unauthorized');
    }

    const card = await db.card.update({
      where: {
        id,
      },
      data: {
        dueDate: date,
      },
    });

    if (!card) {
      throw new Error('Card not found');
    }

    // revalidatePath(`/boards/${boardId}`);
    return {
      card,
      message: 'Your card Due Date has been updated.',
    };
  });

export const updateCardDescription = actionClient
  .schema(updateCardDescriptionSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id, boardId, description } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const board = await db.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        invitations: {
          where: {
            status: 'accepted',
            memberId: userId,
          },
        },
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    const isUserBoardOwner = board.ownerId === userId;
    const isUserABoardMember = board.invitations.length > 0;

    if (!isUserBoardOwner && !isUserABoardMember) {
      throw new AuthorizationError('Unauthorized');
    }

    const sanitizedDescription = DOMPurify.sanitize(description);

    const card = await db.card.update({
      where: {
        id,
      },
      data: {
        description: sanitizedDescription,
      },
    });

    if (!card) {
      throw new Error('Card not found');
    }

    revalidatePath(`/boards/${boardId}`);
    return {
      card,
      message: 'Card description has been updated.',
    };
  });

export const updateCardsOrder = actionClient
  .schema(updateCardOrderSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { cards, boardId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const transaction = cards.map((card) =>
      db.card.update({
        where: {
          id: card.id,
        },
        data: {
          position: card.position,
          listId: card.listId,
        },
      })
    );

    const updatedCards = await db.$transaction(transaction);

    if (!updatedCards) {
      throw new Error('Errow while reordering cards');
    }

    revalidatePath(`/boards/${boardId}`);
    return {
      updatedCards,
      message: 'Card has been reordered.',
    };
  });

export const assignMemberToCard = actionClient
  .schema(assignMemberToCardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { cardId, memberId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const card = await db.card.update({
      where: {
        id: cardId,
      },
      data: {
        assignedTo: {
          connect: {
            id: memberId,
          },
        },
      },
      include: {
        list: true,
      },
    });

    // revalidatePath(`/boards/${card.list.boardId}`);
    return {
      card,
      message: 'Member assigned to card sucessfully.',
    };
  });

export const unassignMember = actionClient
  .schema(unassignMemberCardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { cardId, memberId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    const card = await db.card.update({
      where: {
        id: cardId,
      },
      data: {
        assignedTo: {
          disconnect: {
            id: memberId,
          },
        },
      },
      include: {
        list: true,
      },
    });

    // revalidatePath(`/boards/${card.list.boardId}`);
    return {
      card,
      message: 'Member unassigned sucessfully.',
    };
  });
