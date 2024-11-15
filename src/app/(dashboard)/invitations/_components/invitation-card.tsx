import { Card, CardContent } from '@/components/ui/card';
import { InvitationWithBoardWithMember } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Sparkles } from 'lucide-react';

import React from 'react';
import InvitationUpdateStatusForm from './invitation-update-status-form';
import { clerkClient } from '@clerk/nextjs/server';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  invitation: InvitationWithBoardWithMember;
}

const colorMap = {
  red: 'from-red-500 to-red-800',
  orange: 'from-orange-500 to-orange-800',
  yellow: 'from-yellow-500 to-yellow-800',
  green: 'from-green-500 to-green-800',
  blue: 'from-blue-500 to-blue-800',
};

const InvitationCard = async ({ invitation }: Props) => {
  const boardOwner = await clerkClient().users.getUser(
    invitation.board.ownerId
  );

  const bgColor =
    colorMap[invitation.board.color as keyof typeof colorMap] ??
    'from-gray-500 to-gray-800';

  return (
    <Card>
      <CardContent className="p-0">
        <div
          className={`flex items-center justify-between rounded-t-lg p-6 bg-gradient-to-r ${bgColor}`}
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={''} alt={invitation.boardId} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {invitation.board.name}
              </h2>
              <p className="text-slate-200">
                Invited by {boardOwner.username ?? 'unknown'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Sparkles className="text-white animate-pulse mb-2" />
            <p className="text-xs text-slate-200">
              {new Intl.DateTimeFormat('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }).format(invitation.createdAt)}
            </p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-b-lg">
          <p className="text-gray-600 mb-4">
            You've been invited to collaborate on the "{invitation.board.name}"
            board. Join now to start working together!
          </p>

          <InvitationUpdateStatusForm invitation={invitation} />
        </div>
      </CardContent>
    </Card>
  );
};

InvitationCard.Skeleton = function () {
  return (
    <Card className="h-[254px]">
      <CardContent className="p-0">
        <Skeleton className="h-[100px]" />
        <div className="h-[154px] flex justify-end items-end space-x-4 p-6">
          <Skeleton className="h-10 w-24 rounded" /> {/* Accept button */}
          <Skeleton className="h-10 w-32 rounded" /> {/* Reject button */}
        </div>
      </CardContent>
    </Card>
  );
};

// @ts-ignore
InvitationCard.Skeleton.displayName = 'InvitionCard.Skeleton';

export default InvitationCard;
