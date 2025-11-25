import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../../../hooks/useContract';
import { useWallet } from '../../../hooks/useWallet';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';

export default function CreatorPayouts() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [vaultBalance, setVaultBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (address) {
      loadPayoutData();
    }
  }, [address]);

  const loadPayoutData = async () => {
    setLoading(true);
    try {
      if (address) {
        const vaultArgs = new Args();
        vaultArgs.add(address);
        const vaultData = await readContract('getVaultBalance', vaultArgs);
        // Deserialize and set
        // Mock for now
        setVaultBalance(1250);
        setTotalEarned(3500);
      }
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address) return;
    if (vaultBalance === 0) {
      toast.error('No balance to withdraw');
      return;
    }

    setWithdrawing(true);
    try {
      const args = new Args();
      args.add(0); // 0 = withdraw all
      await callContract('withdrawEarnings', args);
      toast.success('Earnings withdrawn!');
      loadPayoutData();
    } catch (error) {
      toast.error('Failed to withdraw earnings');
      console.error(error);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 gradient-text">Payouts</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <Wallet className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{vaultBalance} MASSA</div>
          <div className="text-white/70">Available to Withdraw</div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || vaultBalance === 0}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{withdrawing ? 'Withdrawing...' : 'Withdraw All'}</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{totalEarned} MASSA</div>
          <div className="text-white/70">Total Earned (All Time)</div>
        </motion.div>
      </div>

      {/* Withdrawal History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-white/70">No withdrawals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Withdrawal</p>
                    <p className="text-sm text-white/70">{new Date(withdrawal.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">+{withdrawal.amount} MASSA</p>
                    <p className="text-sm text-green-300">Completed</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

