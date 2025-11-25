import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { Sparkles, Wallet, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
  const { connect, connected, wallets, refreshWallets, discoveringWallets } = useWallet();
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    refreshWallets().catch(() => {
      /* handled inside context */
    });
  }, [refreshWallets]);

  const handleConnect = async (providerName?: string) => {
    setLoadingProvider(providerName ?? 'auto');
    try {
      await connect(providerName);
      toast.success('Wallet connected!');
      navigate('/explore');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    } finally {
      setLoadingProvider(null);
    }
  };

  if (connected) {
    navigate('/explore');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 gradient-text">Welcome Back</h1>
          <p className="text-white/70">Connect your wallet to continue</p>
        </div>

        <div className="space-y-4">
          {wallets.length ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={loadingProvider !== null}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Wallet className="w-5 h-5" />
                <span>
                  {loadingProvider === wallet.name ? 'Connecting...' : `Connect ${wallet.label}`}
                </span>
              </button>
            ))
          ) : (
            <div className="text-center text-white/70 space-y-3">
              <p>Launch Bearby or Massa Station, then detect wallets.</p>
              <button
                onClick={() => handleConnect()}
                disabled={loadingProvider !== null}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Wallet className="w-5 h-5" />
                <span>{loadingProvider ? 'Connecting...' : 'Auto Connect'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => refreshWallets()}
            disabled={discoveringWallets}
            className="w-full px-6 py-3 glass rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${discoveringWallets ? 'animate-spin' : ''}`} />
            <span>{discoveringWallets ? 'Scanning wallets...' : 'Detect wallets again'}</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

