'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SquareKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ModalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = () => {
    if (open) {
      router.back();
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <SquareKanban className="w-16 h-16" />
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold pt-2">
            Create Your Board
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-muted-foreground text-sm">
          Design your perfect workspace. Choose a name and color to get started
          on your next big project.
        </DialogDescription>
        {children}
        <DialogClose asChild />
      </DialogContent>
    </Dialog>
  );
}
