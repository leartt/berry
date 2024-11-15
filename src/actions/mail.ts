'use server';

import { EmailTemplate } from '@/components/email-template';

import { resend } from '@/lib/resend-mail';
import { User } from '@clerk/nextjs/server';

export interface SendInvitationEmailProps {
  emails: string[];
  inviter: User;
  boardName: string;
  boardId: string;
}

export const sendInvitationEmail = async ({
  emails,
  inviter,
  boardName,
  boardId,
}: SendInvitationEmailProps) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Berry <berry@resend.dev>',
      to: emails,
      subject: 'Invitation to the board',
      react: EmailTemplate({ emails, inviter, boardName, boardId }),
    });

    if (error) {
      return { sucess: false, error };
    }

    return { sucess: true, data };
  } catch (error) {
    return { sucess: false, error: 'Error while sending the email' };
  }
};
