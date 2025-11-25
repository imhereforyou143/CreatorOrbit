import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  IAccount,
  IProvider,
  providers as discoverProviders,
} from '@massalabs/wallet-provider';
import { JsonRPCClient } from '@massalabs/massa-web3';

type WalletContextValue = {
  account: IAccount | null;
  provider: IProvider | null;
  address: string | null;
  client: JsonRPCClient | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [account, setAccount] = useState<IAccount | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState<JsonRPCClient | null>(() => JsonRPCClient.buildnet());

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const available = await discoverProviders(true, 5000, 500);
      if (!available.length) {
        throw new Error('No Massa wallet detected. Please open Massa Station or Bearby.');
      }

      const target = available.find((p) => p.enabled()) ?? available[0];

      if (!target.connected()) {
        const approved = await target.connect();
        if (!approved) {
          throw new Error('Wallet connection rejected.');
        }
      }

      const accounts = await target.accounts();
      if (!accounts.length) {
        throw new Error('No accounts returned by wallet.');
      }

      setProvider(target);
      setAccount(accounts[0]);
      setConnected(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to connect wallet. Please try again.';
      setProvider(null);
      setAccount(null);
      setConnected(false);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (provider && provider.connected()) {
      await provider.disconnect();
    }
    setProvider(null);
    setAccount(null);
    setConnected(false);
  }, [provider]);

  useEffect(() => {
    if (!provider) return;

    const subscription = provider.listenAccountChanges(async () => {
      const accounts = await provider.accounts();
      setAccount(accounts.length ? accounts[0] : null);
      setConnected(accounts.length > 0);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [provider]);

  const value = useMemo(
    () => ({
      account,
      provider,
      client,
      connected,
      loading,
      error,
      connect,
      disconnect,
      address: account?.address() ?? null,
    }),
    [account, client, connected, connect, disconnect, error, loading, provider],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return ctx;
}

