import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import './globals.css';
import { cn } from '@/lib/utils';
import Privy from '@/components/privy';

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
        <Privy>{children}</Privy>
      </body>
    </html>
  );
}
