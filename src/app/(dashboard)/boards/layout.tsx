import { Suspense } from 'react';
import BoardSkeleton from './_components/board-skeleton';

export default function Layout({
  modal,
  children,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <>
      {modal}
      <Suspense fallback={<BoardSkeleton />}>{children}</Suspense>
    </>
  );
}
