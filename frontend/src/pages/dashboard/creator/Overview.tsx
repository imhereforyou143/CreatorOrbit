import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../../hooks/useWallet';
import { useContract } from '../../../hooks/useContract';
import { Args } from '@massalabs/massa-web3';

export default function CreatorOverview() {
  const { address } = useWallet();
  const { readContract } = useContract();
  const [stats, setStats] = useState({
    subscribers: 0,
    earnings: 0,
    content: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadStats();
    }
  }, [address]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load vault balance
      let earningsOnChain = 0;

      if (address) {
        const vaultArgs = new Args();
        vaultArgs.addString(address);
        const vaultData = await readContract('getVaultBalance', vaultArgs);

        if (vaultData) {
          const decoded = new Args(vaultData);
          const raw = decoded.nextU64();
          earningsOnChain = Number(raw) / 1e9;
        }
      }

      // Mock stats combined with live earnings
      setStats({
        subscribers: 42,
        earnings: earningsOnChain,
        content: 18,
        monthlyRevenue: earningsOnChain / 12,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8 gradient-text">Creator Overview</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <Users className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{stats.subscribers}</div>
          <div className="text-white/70">Active Subscribers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <DollarSign className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{stats.earnings}</div>
          <div className="text-white/70">Total Earned (MASSA)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl"
        >
          <FileText className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{stats.content}</div>
          <div className="text-white/70">Content Pieces</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-2xl"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{stats.monthlyRevenue}</div>
          <div className="text-white/70">Monthly Revenue</div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
              <p className="font-semibold">New subscriber</p>
              <p className="text-sm text-white/70">2 hours ago</p>
            </div>
            <span className="text-green-400">+5 MASSA</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
              <p className="font-semibold">Content published</p>
              <p className="text-sm text-white/70">1 day ago</p>
            </div>
            <span className="text-purple-400">New post</span>
          </div>
        </div>
      </div>
    </div>
  );
}

