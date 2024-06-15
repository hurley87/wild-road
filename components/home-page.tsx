'use client';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';

export default function HomePage() {
  const { login, user } = usePrivy();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {user ? (
        <Button>Click me</Button>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </main>
  );
}
