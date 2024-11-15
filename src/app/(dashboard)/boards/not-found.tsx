import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-50px)] w-full flex flex-col items-center justify-center">
      <h2 className="text-3xl">Oops! Board not found</h2>
      <Link href="/boards" className="hover:underline underline-offset-4">
        Back to boards
      </Link>
    </div>
  );
}
