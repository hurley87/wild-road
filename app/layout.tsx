import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import './globals.css';
import { cn } from '@/lib/utils';
import Privy from '@/components/privy';
import Header from '@/components/header';
import PrivyReady from '@/components/privy-ready';
import ConvexClientProvider from './ConvexClientProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Ideonetwork',
  description: 'Create and Collect Ideas',
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-serif antialiased',
          fontSans.variable
        )}
      >
        <Analytics />
        <Privy>
          <ConvexClientProvider>
            <Header />
            <div className="flex flex-col flex-1 p-6">
              <PrivyReady>{children}</PrivyReady>
            </div>
          </ConvexClientProvider>
        </Privy>
        <Toaster />
      </body>
    </html>
  );
}
