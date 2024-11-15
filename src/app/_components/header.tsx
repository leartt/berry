import { Button } from '@/components/ui/button';
import { ChevronDown, Menu, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import UserButton from './user-button';

import HamburgerMenu from './hamburger-menu';

const Header = () => {
  return (
    <header className="h-[50px] bg-white z-[1000] sticky inset-0 border-b-2 w-full px-8">
      <div className="h-full flex items-center">
        <Link href="/" className="flex items-center font-extrabold text-xl">
          <Image
            src="/logo.svg"
            alt="logo"
            width={45}
            height={45}
            className="max-w-fit"
          />
          <span className="hidden md:block -ml-2">Berry</span>
        </Link>

        <nav className="hidden md:block ml-10 text-muted-foreground font-medium">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link
                href="/boards"
                className="flex items-center p-2 rounded hover:bg-secondary"
              >
                Boards
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="flex items-center p-2 rounded hover:bg-secondary"
              >
                More <ChevronDown size={18} strokeWidth={2} />
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="hidden md:block flex-1 text-primary font-medium">
          <ul className="flex flex-1 justify-end items-center gap-4 text-sm">
            <li>
              <Link
                href="/"
                className="flex items-center p-2 rounded hover:bg-secondary"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#features"
                className="flex items-center p-2 rounded hover:bg-secondary"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/#pricing"
                className="flex items-center p-2 rounded hover:bg-secondary"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex ml-auto md:ml-4 self-center space-x-2">
          <UserButton />
          <div className="md:hidden">
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
