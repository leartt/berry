import { useEffect, useState } from 'react';
import { getBoardMembers, removeMemberFromBoard } from '@/actions/member';
import { useAuth } from '@clerk/nextjs';
import { cn, mergeInitials } from '@/lib/utils';
import { Board, Member } from '@prisma/client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { useAction } from 'next-safe-action/hooks';
import { Input } from '@/components/ui/input';

interface Props {
  board: Board;
}

const BoardMembersAvatar = ({ board }: Props) => {
  const { userId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);

  const { execute } = useAction(removeMemberFromBoard, {
    onSuccess: ({ data }) => {
      toast(data?.message, { type: 'success' });
    },
    onError: () => {
      toast('Error while removing member from board', { type: 'error' });
    },
  });

  const handleRemoveMember = (formData: FormData) => {
    const memberId = formData.get('memberId') as string;
    execute({ boardId: board.id, memberId });
  };

  useEffect(() => {
    (async () => {
      const res = await getBoardMembers(board.id);
      if (!res.success) {
        console.log('error fetching board members');
        return;
      }
      setMembers(res.boardMembers);
    })();
  }, [board]);

  return (
    <div className="relative flex mx-3">
      {members?.map((member) => (
        <PopoverProvider
          key={member.id}
          render={(setIsOpen) => (
            <>
              <PopoverTrigger>
                <MemberAvatar member={member} />
              </PopoverTrigger>
              <PopoverContent className="w-[290px] p-2 flex flex-col gap-4">
                <Button
                  asChild
                  variant="ghost"
                  className="absolute p-[3px] w-fit h-fit right-2 top-2 text-black cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span>
                    <XIcon className="h-4 w-4" />
                  </span>
                </Button>
                <div className="flex items-center gap-2">
                  <MemberAvatar
                    member={member}
                    className="h-16 w-16 text-2xl"
                  />
                  <div>
                    <p className="text-primary font-bold">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {member.username ? `@${member.username}` : member.email}
                    </p>
                  </div>
                </div>

                {/* display button only if logged in user is the owner, and the member is not the logged in user */}
                {board.ownerId === userId && member.userId !== userId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Remove from board
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. It will remove the
                          member from the board.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <form action={handleRemoveMember}>
                          <Input
                            type="hidden"
                            name="memberId"
                            value={member.id}
                            className="sr-only"
                          />
                          <AlertDialogAction type="submit">
                            Remove
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </PopoverContent>
            </>
          )}
        />
      ))}
    </div>
  );
};

function PopoverProvider({
  render,
}: {
  render: (
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {render(setOpen)}
    </Popover>
  );
}

function MemberAvatar({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        'h-6 w-6 ring-[2px] ring-blue-700 text-[8px] cursor-pointer',
        className
      )}
    >
      <AvatarFallback className="text-primary font-bold">
        {mergeInitials(member.firstName, member.lastName)}
      </AvatarFallback>
    </Avatar>
  );
}
export default BoardMembersAvatar;
