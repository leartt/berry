import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import InvitationSearchForm from './_components/invitation-search-form';
import InvitationCard from './_components/invitation-card';
import NoInvitationsFound from './_components/no-invitations-found';
import { Suspense } from 'react';

const sortFieldMap: Record<string, string> = {
  date: 'createdAt', // 'date' corresponds to 'createdAt' in the database
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

const InvitationsPage = async ({ searchParams }: Props) => {
  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const searchQuery = searchParams.search as string;
  const sortField = searchParams.sort
    ? sortFieldMap[searchParams.sort as string]
    : null;
  const order =
    sortField && ['asc', 'desc'].includes(searchParams.order as string)
      ? (searchParams.order as string)
      : 'desc';

  let invitations = await db.invitation.findMany({
    where: {
      status: 'pending',
      member: {
        userId,
      },

      ...(searchQuery
        ? {
            board: {
              name: { contains: searchQuery, mode: 'insensitive' },
            },
          }
        : {}),
    },
    include: {
      board: true,
      member: true,
    },
    // Apply orderBy only if sortField exists
    ...(sortField ? { orderBy: { [sortField]: order } } : {}),
  });

  const suspenseKey = `${searchParams.sort}-${searchParams.order}-${searchParams.search}`;

  return (
    <div className="py-4 overflow-scroll h-[calc(100vh-50px)] container">
      {invitations.length === 0 && !sortField && !searchQuery ? (
        <NoInvitationsFound />
      ) : (
        <>
          <InvitationSearchForm />

          {invitations.length === 0 ? (
            <div>No invitations found</div>
          ) : (
            <div className="flex flex-col gap-10">
              <Suspense
                key={suspenseKey}
                fallback={<InvitationCard.Skeleton />}
              >
                {invitations.map((invitation) => (
                  <InvitationCard key={invitation.id} invitation={invitation} />
                ))}
              </Suspense>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvitationsPage;
