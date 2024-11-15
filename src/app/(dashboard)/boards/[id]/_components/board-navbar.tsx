'use client';

import { Board } from '@prisma/client';
import BoardNameForm from './board-name-form';
import { Button } from '@/components/ui/button';
import { Suspense, useState } from 'react';
import InviteMembers from './invite-user';
import BoardMembersAvatar from './board-members-avatar';
import { BoardWithInvitationWithMember } from '@/lib/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const BoardNavbar = ({ board }: { board: Board }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div className="h-[50px] w-full flex-1 bg-primary text-secondary">
      <div className="flex items-center h-full px-4">
        <BoardNameForm board={board} />

        <div className="flex w-full justify-end items-center">
          <Suspense fallback={'loading...'}>
            <BoardMembersAvatar board={board} />
          </Suspense>

          <Button
            variant={'secondary'}
            className="mr-4"
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite
          </Button>
        </div>

        <InviteMembers
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          boardOwnerId={board.ownerId}
        />
      </div>
    </div>
  );
};

export default BoardNavbar;
