'use client';
import { Button } from '@/components/ui/button';
import { UserButton as ClerkUserButton, useAuth } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DotIcon, UserCircle } from 'lucide-react';
import Link from 'next/link';

const UserButton = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? (
    <ClerkUserButton>
      <ClerkUserButton.MenuItems>
        <ClerkUserButton.Action
          label="Help"
          labelIcon={<DotIcon />}
          open="help"
        />
      </ClerkUserButton.MenuItems>
    </ClerkUserButton>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserCircle />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={'/login'} className="w-full">
            Login
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={'/sign-up'} className="w-full">
            Sign up
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
