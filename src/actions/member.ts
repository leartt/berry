'use server';
import AuthorizationError from '@/lib/AuthorizationError';
import prisma from '@/lib/db';
import db from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import {
  getBoardMembersSchema,
  removeMemberFromBoardSchema,
} from '@/schemas/member';
import { auth, currentUser } from '@clerk/nextjs/server';
import { flattenValidationErrors } from 'next-safe-action';
import { revalidatePath } from 'next/cache';

/* Used to synchronize new signed up user with member data in the database. 
      TLDR: When a new user signs up, we create a member in the database.
*/
export const getAuthSyncStatus = async () => {
  const authUser = await currentUser();

  if (!authUser) {
    return { isSynced: false };
  }

  const member = await prisma.member.findUnique({
    where: {
      userId: authUser.id,
    },
  });

  if (!member) {
    console.log('member not in DB');
    await prisma.member.create({
      data: {
        firstName: authUser.firstName!,
        lastName: authUser.lastName!,
        userId: authUser.id,
        email: authUser.emailAddresses[0].emailAddress,
        username: authUser.username,
      },
    });
  }

  return { isSynced: true };
};

export const getBoardMembers = async (boardId: string) => {
  const boardWithMembers = await db.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      invitations: {
        where: {
          status: 'accepted',
        },
        include: {
          member: true,
        },
      },
    },
  });

  if (!boardWithMembers) {
    return {
      success: true,
      boardMembers: [],
    };
  }

  const owner = await db.member.findUnique({
    where: {
      userId: boardWithMembers.ownerId,
    },
  });

  const boardMembers = boardWithMembers.invitations.map(
    (invitation) => invitation.member
  );

  const members = owner ? [owner, ...boardMembers] : boardMembers;

  return { success: true, boardMembers: members };
};

export const removeMemberFromBoard = actionClient
  .schema(removeMemberFromBoardSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { boardId, memberId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    await db.invitation.delete({
      where: {
        boardId_memberId: {
          boardId,
          memberId,
        },
      },
    });

    const cardsToUpdate = await db.card.findMany({
      where: {
        list: {
          boardId,
        },
        assignedTo: {
          some: {
            id: memberId,
          },
        },
      },
    });

    const transaction = await db.$transaction(
      cardsToUpdate.map((card) =>
        db.card.update({
          where: {
            id: card.id,
          },
          data: {
            assignedTo: {
              disconnect: {
                id: memberId, // Disconnect the member from this card
              },
            },
          },
        })
      )
    );

    if (!transaction) {
      throw new Error('Error while removing member from cards');
    }

    revalidatePath(`/boards/${boardId}`);
    return {
      message: 'The member has been removed from the board.',
    };
  });

export const searchMembers = async (query: string) => {
  const members = await db.member.findMany({
    where: {
      OR: [
        {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    take: 5,
    include: {
      invitations: {
        select: {
          board: {
            select: {
              id: true,
              ownerId: true,
            },
          },
        },
      },
    },
  });

  return members;
};
