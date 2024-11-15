'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Search, SortAsc, SortDesc } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  startTransition,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts';

const InvitationSearchForm = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (newParams: Record<string, string>) => {
      const currentParams = new URLSearchParams(searchParams?.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        currentParams.set(key, value);
      });

      return currentParams.toString();
    },
    [searchParams, router]
  );

  const handleSetSearchQuery = useDebounceCallback((value) => {
    setSearchQuery(value);
    const query = createQueryString({ search: value });
    router.replace(`${pathname}?${query}`);
  }, 300);

  return (
    <div className="w-full pb-6">
      <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
        <div className="flex-grow">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search by board name or inviter"
              defaultValue={searchQuery}
              onChange={(e) => handleSetSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(newOrder);
            let query = createQueryString({ sort: 'date', order: newOrder });
            router.replace(`${pathname}?${query}`);
          }}
          className="w-full sm:w-auto"
        >
          Sort by Date{' '}
          {sortOrder === 'asc' ? (
            <SortAsc className="ml-2" />
          ) : (
            <SortDesc className="ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default InvitationSearchForm;
