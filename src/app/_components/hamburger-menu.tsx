'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import UserButton from './user-button';
import { tailwindBreakpoints } from '@/lib/utils';
import Image from 'next/image';

export default function HamburgerMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const isMdScreenAndUp = useMediaQuery(tailwindBreakpoints.md, {
    initializeWithValue: false,
  });

  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault(); // Prevent default anchor behavior
    setIsMenuOpen(false); // Close the menu after navigation

    router.push(href);
  };

  return (
    !isMdScreenAndUp && (
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="top-[50px] w-[300px] sm:w-[400px]"
        >
          <SheetTitle className="flex items-center mb-8">
            <Image src="/logo.svg" alt="logo" width={45} height={45} />
            Berry
          </SheetTitle>
          <nav className="flex flex-col gap-4">
            {[
              { href: '/', label: 'Home' },
              { href: '/boards', label: 'Boards' },
              { href: '/workspaces', label: 'Workspaces' },
              { href: '/#features', label: 'Features' },
              { href: '/#pricing', label: 'Pricing' },
            ].map((item) => (
              <Link
                key={item.href}
                className="text-lg font-medium hover:underline underline-offset-4"
                href={item.href}
                onClick={(event) => handleNavigation(event, item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    )
  );
}
