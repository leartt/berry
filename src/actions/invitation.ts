'use server';

import AuthorizationError from '@/lib/AuthorizationError';
import db from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import {
  createInvitationSchema,
  updateInvitationStatusSchema,
} from '@/schemas';
import { auth, clerkClient, currentUser, User } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { flattenValidationErrors } from 'next-safe-action';
import { revalidatePath } from 'next/cache';
import { sendInvitationEmail } from './mail';

export const getUserById = async (id: string) => {
  const user = await clerkClient.users.getUser(id);

  if (!user) {
    return null;
  }

  return user;
};

export const createInvitation = actionClient
  .schema(createInvitationSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { status, boardId, membersId } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    try {
      const invitations = await db.invitation.createManyAndReturn({
        include: {
          member: true,
          board: true,
        },
        data: membersId.map((memberId) => ({
          boardId,
          memberId,
          status,
        })),
      });
      //   const invitations = { count: 0 };

      if (invitations.length === 0) {
        throw new Error(
          `Invitation${invitations.length > 1 ? 's' : ''} could not be created`
        );
      }

      const memberEmails = invitations.map((inv) => inv.member.email);
      const boardName = invitations[0].board.name;
      const inviter = await currentUser();

      const res = await sendInvitationEmail({
        emails: memberEmails,
        inviter: inviter as User,
        boardName,
        boardId,
      });
      if (res.error) {
        console.log(res.error);
        throw new Error('Error while sending the email');
      }

      console.log('emails', res.data);

      return {
        message: `Invitation${invitations.length > 1 ? 's' : ''} sent`,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(error instanceof Prisma.PrismaClientKnownRequestError);
        if (error.code === 'P2002') {
          // P2002 is the error code for unique constraint violation
          throw new Error('The member is already invited to this board');
        }
      }

      throw new Error(error.message);
    }
  });

export const updateInvitationStatus = actionClient
  .schema(updateInvitationStatusSchema, {
    handleValidationErrorsShape: (e) => flattenValidationErrors(e).fieldErrors,
  })
  .action(async ({ parsedInput: { id, status } }) => {
    const { userId } = auth();

    if (!userId) {
      throw new AuthorizationError('Unauthorized');
    }

    if (status === 'rejected') {
      await db.invitation.delete({
        where: {
          id,
        },
      });

      revalidatePath('/invitations');
      return {
        invitation: null,
        message: 'Invitation rejected',
      };
    }

    const invitation = await db.invitation.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    revalidatePath('/invitations');
    return {
      invitation,
      message:
        status === 'accepted' ? 'Invitation accepted' : 'Invitation rejected',
    };
  });
