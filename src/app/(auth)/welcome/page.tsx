'use client';

import { getAuthSyncStatus } from '@/actions/member';
import { useQuery } from '@tanstack/react-query';
import { Loader2, LucideProps } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['get-auth-sync-status'],
    queryFn: async () => {
      return await getAuthSyncStatus();
    },
    refetchInterval: (query) => {
      return query.state.data?.isSynced ? false : 1000;
    },
  });

  useEffect(() => {
    if (data?.isSynced) {
      router.push('/boards');
    }
  }, [data, router]);

  return (
    <div className="flex w-full flex-1 h-[calc(100vh-50px)] items-center justify-center px-4">
      <BackgroundPattern className="absolute inset-0 z-0 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-10" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-16 h-16 animate-spin" />
        <h1 className="text-4xl">Creating your account...</h1>
        <p className="text-base text-gray-600 max-w-prose">
          Just a moment while we set things up for you.
        </p>
      </div>
    </div>
  );
}

function BackgroundPattern(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="600"
      viewBox="0 0 800 600"
      className={props.className}
    >
      <g fill="none" stroke="#010A09" strokeWidth="1">
        <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" />
        <path d="M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764" />
        <path d="M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880" />
        <path d="M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382" />
        <path d="M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269" />
      </g>
      <g fill="#0E7157">
        <circle cx="769" cy="229" r="5" />
        <circle cx="539" cy="269" r="5" />
        <circle cx="603" cy="493" r="5" />
        <circle cx="731" cy="737" r="5" />
        <circle cx="520" cy="660" r="5" />
        <circle cx="309" cy="538" r="5" />
        <circle cx="295" cy="764" r="5" />
        <circle cx="40" cy="599" r="5" />
        <circle cx="102" cy="382" r="5" />
        <circle cx="127" cy="80" r="5" />
        <circle cx="370" cy="105" r="5" />
        <circle cx="578" cy="42" r="5" />
        <circle cx="237" cy="261" r="5" />
        <circle cx="390" cy="382" r="5" />
      </g>
    </svg>
  );
}
