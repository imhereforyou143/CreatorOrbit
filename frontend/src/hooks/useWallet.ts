import { useState, useEffect } from 'react';
import { useWallet as useMassaWallet } from '@massalabs/wallet-provider';
import { JsonRPCClient } from '@massalabs/massa-web3';

export function useWallet() {
  const { account, connect, disconnect } = useMassaWallet();
  const [client, setClient] = useState<JsonRPCClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (account) {
      setConnected(true);
      // Initialize client with account
      const rpcClient = JsonRPCClient.buildnet();
      setClient(rpcClient);
    } else {
      setConnected(false);
      setClient(null);
    }
  }, [account]);

  return {
    account,
    connect,
    disconnect,
    connected,
    client,
    address: account?.address() || null,
  };
}
