import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full px-4 py-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blackberry-FEqNhbCLMZLU62dJGU3QTLbkQv7bQP.svg"
              alt="Berry Logo Large"
              fill
              className="object-contain opacity-20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary">404</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
            It seems you've stumbled upon a page that doesn't exist. Don't
            worry, even the best task managers lose track sometimes!
          </p>
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
