import { assignMemberToCard, unassignMember } from '@/actions/card';
import { getBoardMembers } from '@/actions/member';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  CardWithMembers,
  CardWithMembersWithList,
  RequiredModalProps,
} from '@/lib/types';
import { cn, mergeInitials } from '@/lib/utils';
import { Member } from '@prisma/client';
import { Loader, Loader2 } from 'lucide-react';
import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
// import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface Props extends RequiredModalProps {
  optimisticCard: CardWithMembersWithList;
  setOptimisticCard: Dispatch<SetStateAction<CardWithMembersWithList>>;
}

const AssignMemberToCardModal = ({
  isOpen,
  closeModal,
  optimisticCard,
  setOptimisticCard,
}: Props) => {
  const params = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [boardMembers, setBoardMembers] = useState<Member[]>([]);
  const [isLoadingBoardMembers, setIsLoadingBoardMembers] = useState(false);

  console.log('BOARD MEMBERS', boardMembers);

  useEffect(() => {
    const fetchBoardMembers = async () => {
      setIsLoadingBoardMembers(true);
      const res = await getBoardMembers(params.id);
      if (!res.success) {
        console.log('error fetching board members');
      }
      setBoardMembers(res.boardMembers);
      setIsLoadingBoardMembers(false);
    };
    fetchBoardMembers();
  }, [params.id]);

  const cardMembers = useMemo(() => {
    return optimisticCard.assignedTo.filter(
      (m) =>
        m?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m?.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [optimisticCard, searchQuery]);

  const boardMembersNotAssigned = useMemo(() => {
    return boardMembers?.filter(
      (bm) =>
        !optimisticCard.assignedTo.some((m) => m.id === bm.id) &&
        (bm.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bm.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bm.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bm.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [boardMembers, searchQuery, optimisticCard]);

  const { execute: executeAssignMember } = useAction(assignMemberToCard, {
    onError: () => {
      toast.error('Error, please try again');
    },
  });

  const { execute: executeUnassignMember } = useAction(unassignMember, {
    onError: () => {
      toast.error('Error, please try again');
    },
  });

  const handleSelect = (memberId: string) => {
    if (optimisticCard.assignedTo.some((m) => m.id === memberId)) {
      setOptimisticCard((prev) => ({
        ...prev,
        assignedTo: prev.assignedTo.filter((m) => m.id !== memberId),
      }));

      executeUnassignMember({ cardId: optimisticCard.id, memberId });
    } else {
      setOptimisticCard((prev) => ({
        ...prev,
        assignedTo: [
          ...prev.assignedTo,
          boardMembers?.find((m) => m.id === memberId) as Member,
        ],
      }));
      executeAssignMember({ cardId: optimisticCard.id, memberId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] w-full bg-white p-4">
        <DialogHeader>
          <DialogTitle className="text-center">
            Assign members to card
          </DialogTitle>
        </DialogHeader>

        <form>
          <div>
            <Input
              type="text"
              id="members"
              name="members"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              placeholder="Search members"
            />

            <>
              <ul className="list-none space-y-2 mt-4">
                {cardMembers && cardMembers.length > 0 && (
                  <h2 className="text-sm font-medium">Card members</h2>
                )}
                {cardMembers.map((member) => (
                  <li
                    key={member.id}
                    className={cn(
                      'relative flex w-full gap-2 items-center p-1 cursor-pointer rounded-lg bg-none hover:bg-none text-sm',
                      optimisticCard.assignedTo.some(
                        (m) => m.id === member.id
                      ) && ''
                      // "after:content-['x'] after:absolute after:text-red-500 after:top-1/2 after:-translate-y-1/2 after:right-2 after:font-bold"
                    )}
                  >
                    <Avatar className="flex justify-center items-center bg-red-500">
                      <div className="">
                        {mergeInitials(member.firstName, member.lastName)}
                      </div>
                    </Avatar>
                    {member.firstName} {member.lastName}
                    <Button
                      className="ml-auto text-xs"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelect(member.id)}
                    >
                      X
                    </Button>
                  </li>
                ))}
              </ul>
              <ul className="list-none space-y-2 mt-4">
                {isLoadingBoardMembers && (
                  <div className="flex w-full justify-center">
                    <Loader className="h-8 w-8 animate-spin " />
                  </div>
                )}
                {boardMembersNotAssigned &&
                  boardMembersNotAssigned.length > 0 && (
                    <h2 className="text-sm font-medium">Board members</h2>
                  )}
                {boardMembersNotAssigned.map((member) => (
                  <li
                    key={member.id}
                    className={cn(
                      'flex w-full gap-2 items-center p-1 cursor-pointer rounded-lg bg-none hover:bg-none text-sm'
                    )}
                    onClick={() => handleSelect(member.id)}
                  >
                    <Avatar className="flex justify-center items-center bg-red-500">
                      <div className="">
                        {mergeInitials(member.firstName, member.lastName)}
                      </div>
                    </Avatar>
                    {member.firstName} {member.lastName}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end pt-8 pb-2 space-x-2">
                <Button variant="outline" className="px-6" onClick={closeModal}>
                  Exit
                </Button>
              </div>
            </>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignMemberToCardModal;
