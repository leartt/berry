import { Board, Invitation } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Props {
  board: Board & { invitations?: Invitation[] };
}

const BoardCard = ({ board }: Props) => {
  const bgColor = `bg-${board.color}-500`;

  return (
    <Link href={`/boards/${board.id}`} prefetch={true}>
      <div
        key={board.id}
        className={`${bgColor} text-secondary min-h-[100px] h-full rounded p-2`}
      >
        <h2>{board.name}</h2>
      </div>
    </Link>
  );
};

const BoardCardNew = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-secondary hover:bg-slate-200 text-secondary min-h-[100px] h-full rounded p-2 flex justify-center items-center">
      {children}
    </div>
  );
};
BoardCardNew.displayName = 'BoardCard.New';
const BoardCardSkeleton = () => {
  return <Skeleton className="min-h-[100px] h-full rounded p-2"></Skeleton>;
};

BoardCardSkeleton.displayName = 'BoardCard.Skeleton';

BoardCard.New = BoardCardNew;
BoardCard.Skeleton = BoardCardSkeleton;

export default BoardCard;
