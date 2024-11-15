import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import SidebarLink from './sidebar-link';

export default async function BoardLinks() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const boards = await db.board.findMany({
    where: {
      OR: [
        {
          ownerId: userId,
        },
        {
          invitations: {
            some: {
              member: {
                userId: userId,
              },
              status: 'accepted',
            },
          },
        },
      ],
    },
  });

  return (
    <ul className="w-full flex flex-col gap-2 text-sm text-muted-foreground">
      {boards.map((board) => {
        const bgColor = `bg-${board.color}-500`;
        return (
          <li key={board.id} className="group hover:bg-secondary rounded">
            <SidebarLink href={`/boards/${board.id}`} className="pl-8">
              <div className="gap-2 md:flex md:items-center">
                <div className={`${bgColor} rounded h-[18px] w-[18px]`}></div>
                <span className="hidden md:block">{board.name}</span>
              </div>
            </SidebarLink>
          </li>
        );
      })}
    </ul>
  );
}
