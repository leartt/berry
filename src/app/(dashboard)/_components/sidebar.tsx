import { Home, InboxIcon, Layers, PlusIcon, SquareKanban } from 'lucide-react';
import SidebarLink from './sidebar-link';
import BoardLinks from './board-links';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-[82px] md:w-[240px] flex-shrink-0 h-[calc(100vh-50px)] overflow-y-auto overflow-x-hidden py-4 z-10 border-r-2">
      <div className="border-b py-4 w-full">
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li title="Boards" className="group hover:bg-secondary rounded">
            <SidebarLink href="/boards" className="pl-8">
              <SquareKanban className="w-[18px] h-[18px]" />
              <span className="hidden md:block">Boards</span>
            </SidebarLink>
          </li>
          <li title="Workspaces" className="group hover:bg-secondary rounded">
            <SidebarLink href="/workspaces" className="pl-8">
              <Layers className="w-[18px] h-[18px]" />
              <span className="hidden md:block">Workspaces</span>
            </SidebarLink>
          </li>
          <li title="Invitations" className="group hover:bg-secondary rounded">
            <SidebarLink href="/invitations" className="pl-8">
              <InboxIcon className="w-[18px] h-[18px]" />
              <span className="hidden md:block">Invitations</span>
            </SidebarLink>
          </li>
          <li title="Home" className="group hover:bg-secondary rounded">
            <SidebarLink href="/" className="pl-8">
              <Home className="w-[18px] h-[18px]" />
              <span className="hidden md:block">Home</span>
            </SidebarLink>
          </li>
        </ul>
      </div>

      <div className="py-4 flex flex-col justify-center w-full space-y-4">
        <h2 className="text-center text-sm flex items-center flex-col md:flex-row md:pl-8 md:justify-between">
          Your Boards
          <Link href="/boards/create">
            <PlusIcon className="md:mr-2" />
          </Link>
        </h2>
        <BoardLinks />
      </div>
    </aside>
  );
};

export default Sidebar;
