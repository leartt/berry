import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default function NoInvitationsFound() {
  async function handleRefresh() {
    'use server';
    revalidatePath('/invitations');
  }

  return (
    <div className="h-full p-2 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden border-none">
          <CardContent className="p-0">
            <div className="p-2 text-black text-center">
              <Inbox className="w-24 h-24 mx-auto mb-4" />

              <h2 className="text-2xl font-bold mb-2">No Pending Invites</h2>
              <p className="text-muted-foreground">
                Your invitation inbox is empty, but great collaborations are on
                the horizon!
              </p>
            </div>
            <div className="p-6 bg-white">
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  While you wait for invitations, why not explore some of these
                  options?
                </p>
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  <Button variant="outline" className="w-full flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Find Teams
                  </Button>
                  <form action={handleRefresh} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </form>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/boards/create">Create a New Board</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
