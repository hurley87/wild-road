import { Address } from 'viem';

export const formatAddress = (address: Address) =>
  address.slice(0, 6) + '...' + address.slice(-4);

export const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const secondsAgo = Math.floor((now - timestamp) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);

  if (secondsAgo < 60) {
    return 'A few seconds ago';
  } else if (minutesAgo < 60) {
    return `${minutesAgo} minutes ago`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo} hours ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const formatImage = (uri: string) => {
  return `https://e8e2507493e324c942ac12af650c4a0d.ipfscdn.io/ipfs/${uri
    .split('ipfs://')
    .pop()}`;
};
