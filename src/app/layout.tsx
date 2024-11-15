import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Header from './_components/header';

import { ClerkProvider } from '@clerk/nextjs';
import { TanstackQueryClientProvider } from './providers/TanstackQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Berry',
  description: 'The ultimate task management app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TanstackQueryClientProvider>
        <html lang="en">
          <body className={inter.className}>
            <Header />
            {children}
            <ToastContainer
              stacked
              pauseOnFocusLoss
              draggable
              pauseOnHover
              position="bottom-right"
            />
          </body>
        </html>
      </TanstackQueryClientProvider>
    </ClerkProvider>
  );
}
