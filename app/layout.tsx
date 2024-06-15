import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import './globals.css';
import { cn } from '@/lib/utils';
import Privy from '@/components/privy';
import Header from '@/components/header';
import PrivyReady from '@/components/privy-ready';
import ConvexClientProvider from './ConvexClientProvider';

export const metadata: Metadata = {
  title: 'Wild Road',
  description: 'Collect ideas',
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
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Analytics />
        <Privy>
          <ConvexClientProvider>
            <div className="min-h-screen w-screen overflow-hidden flex-col flex">
              <Header />
              <div className="mx-auto w-[430px] flex flex-col flex-1 pt-28 px-3">
                <PrivyReady>{children}</PrivyReady>
              </div>
            </div>
          </ConvexClientProvider>
        </Privy>
      </body>
    </html>
  );
}
