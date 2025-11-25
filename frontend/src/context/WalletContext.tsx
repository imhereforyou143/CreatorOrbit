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
  connect: (providerName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  wallets: WalletOption[];
  refreshWallets: () => Promise<WalletOption[]>;
  discoveringWallets: boolean;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

type ProviderFlavor = 'bearby' | 'massastation' | 'generic';
type WalletOption = {
  name: string;
  flavor: ProviderFlavor;
  label: string;
};

type DetectedProvider = WalletOption & { instance: IProvider };

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [providerFlavor, setProviderFlavor] = useState<ProviderFlavor | null>(null);
  const [account, setAccount] = useState<IAccount | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveringWallets, setDiscoveringWallets] = useState(false);
  const [wallets, setWallets] = useState<DetectedProvider[]>([]);
  const [client] = useState<JsonRPCClient | null>(() => JsonRPCClient.buildnet());

  const detectWallets = useCallback(async (): Promise<DetectedProvider[]> => {
    setDiscoveringWallets(true);
    try {
      const detected = await discoverProviders(true, 5000, 500);
      const mapped: DetectedProvider[] = detected.map((instance) => {
        const name = instance.name();
        const flavor = resolveFlavor(name);
        return {
          name,
          flavor,
          label: resolveLabel(name, flavor),
          instance,
        };
      });
      setWallets(mapped);
      return mapped;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to detect Massa wallets at the moment.';
      setError(message);
      setWallets([]);
      throw err;
    } finally {
      setDiscoveringWallets(false);
    }
  }, []);

  const refreshWallets = useCallback(async (): Promise<WalletOption[]> => {
    try {
      const detected = await detectWallets();
      return detected.map(({ name, flavor, label }) => ({ name, flavor, label }));
    } catch (err) {
      throw err;
    }
  }, [detectWallets]);

  useEffect(() => {
    detectWallets().catch(() => {
      // handled in refreshWallets
    });
  }, [detectWallets]);

  const connect = useCallback(
    async (preferredProvider?: string) => {
      setLoading(true);
      setError(null);

      try {
        const available = wallets.length ? wallets : await detectWallets();
        if (!available.length) {
          throw new Error('No Massa wallet detected. Please open Bearby or Massa Station.');
        }

        const queue = preferredProvider
          ? available.filter((p) => p.name === preferredProvider)
          : available;

        if (!queue.length) {
          throw new Error('Selected wallet is not available. Please rescan wallets.');
        }

        let lastError: Error | null = null;
        for (const option of queue) {
          try {
            await ensureProviderConnected(option);
            const accounts = await option.instance.accounts();
            if (!accounts.length) {
              throw new Error('No accounts returned by wallet.');
            }

            setProvider(option.instance);
            setProviderFlavor(option.flavor);
            setAccount(accounts[0]);
            setConnected(true);
            return;
          } catch (err) {
            lastError =
              err instanceof Error
                ? err
                : new Error('Unable to connect wallet. Please try again.');
            console.warn(`Wallet connect failed for ${option.name}:`, lastError);
          }
        }

        throw lastError ?? new Error('Unable to connect wallet. Please try again.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to connect wallet. Please try again.';
        setProvider(null);
        setProviderFlavor(null);
        setAccount(null);
        setConnected(false);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [wallets, detectWallets],
  );

  const disconnect = useCallback(async () => {
    if (provider && providerFlavor === 'bearby') {
      const bearbyProvider = provider as unknown as { disconnect: () => Promise<void>; connected: () => boolean };
      if (bearbyProvider.connected()) {
        await bearbyProvider.disconnect();
      }
    }
    setProvider(null);
    setProviderFlavor(null);
    setAccount(null);
    setConnected(false);
  }, [provider, providerFlavor]);

  useEffect(() => {
    if (!provider || providerFlavor !== 'bearby') return;

    const maybeListener = (provider as unknown as {
      listenAccountChanges?: (cb: (base58: string) => void) => { unsubscribe: () => void };
    }).listenAccountChanges;

    if (!maybeListener) return;

    const subscription = maybeListener(async () => {
      const accounts = await provider.accounts();
      setAccount(accounts.length ? accounts[0] : null);
      setConnected(accounts.length > 0);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [provider, providerFlavor]);

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
      wallets: wallets.map(({ name, flavor, label }) => ({ name, flavor, label })),
      refreshWallets,
      discoveringWallets,
    }),
    [
      account,
      client,
      connected,
      connect,
      disconnect,
      error,
      loading,
      provider,
      wallets,
      refreshWallets,
      discoveringWallets,
    ],
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

function resolveFlavor(name: string): ProviderFlavor {
  const upper = name.toUpperCase();
  if (upper.includes('BEARBY')) return 'bearby';
  if (upper.includes('MASSA')) return 'massastation';
  return 'generic';
}

function resolveLabel(name: string, flavor: ProviderFlavor): string {
  if (flavor === 'bearby') return 'Bearby Wallet';
  if (flavor === 'massastation') return 'Massa Station Wallet';
  return name;
}

async function ensureProviderConnected(option: DetectedProvider) {
  const { instance, flavor } = option;

  const supports = (method: keyof IProvider) => typeof (instance as any)[method] === 'function';

  if (flavor === 'bearby') {
    if (supports('connected') && !(instance as any).connected()) {
      await (instance as any).connect();
    }
    return;
  }

  if (flavor === 'massastation') {
    // Massa Station provider handles sessions internally; nothing to do.
    return;
  }

  if (supports('connected') && !(instance as any).connected()) {
    if (supports('connect')) {
      await (instance as any).connect();
    }
  }
}

