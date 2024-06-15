'use client';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from './loading-spinner';

function PrivyContentWrapper({ children }: { children: React.ReactNode }) {
  const { ready } = usePrivy();

  return ready ? (
    children
  ) : (
    <div className="h-full justify-center flex-1 flex items-center">
      <LoadingSpinner />
    </div>
  );
}

export default PrivyContentWrapper;
