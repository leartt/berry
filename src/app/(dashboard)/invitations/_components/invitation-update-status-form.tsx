'use client';

import { updateInvitationStatus } from '@/actions/invitation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InvitationWithBoardWithMember } from '@/lib/types';
import { clerkClient, User } from '@clerk/nextjs/server';
import { X, Sparkles } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { toast } from 'react-toastify';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: 'accepted' | 'rejected';
  children: React.ReactNode;
}

interface Props {
  invitation: InvitationWithBoardWithMember;
}

export default function InvitationUpdateStatusForm({ invitation }: Props) {
  const router = useRouter();
  const { execute } = useAction(updateInvitationStatus, {
    onSuccess: ({ data }) => {
      toast.success(data?.message);
    },
    onError: ({ error, input }) => {
      toast.error(
        error.fetchError || `Error while ${input.status} the invitation`
      );
    },
  });

  async function handleUpdateInvitationStatus(formData: FormData) {
    const id = invitation.id;
    const status = formData.get('status') as 'accepted' | 'rejected';
    execute({ id, status });
  }

  return (
    <form
      action={handleUpdateInvitationStatus}
      className="flex justify-end space-x-4"
    >
      <Input className="sr-only" hidden defaultValue={invitation.id} />
      <SubmitButton value="rejected">
        <X className="mr-2 h-4 w-4" /> Reject
      </SubmitButton>
      <SubmitButton value="accepted">
        <Sparkles className="mr-2 h-4 w-4" /> Accept Invitation
      </SubmitButton>
    </form>
  );
}

const SubmitButton = ({ children, value, ...props }: ButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      name="status"
      value={value}
      type="submit"
      variant={value === 'rejected' ? 'outline' : 'default'}
      disabled={pending}
      {...props}
    >
      {children}
    </Button>
  );
};
