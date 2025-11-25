import { useState, useEffect } from 'react';
import { Sparkles, Clock, CreditCard, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../../hooks/useWallet';
import { useContract } from '../../../hooks/useContract';
import { Args } from '@massalabs/massa-web3';
import { formatDistanceToNow } from 'date-fns';

export default function UserOverview() {
  const { address } = useWallet();
  const { readContract } = useContract();
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadUserData();
    }
  }, [address]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Check trial status
      if (address) {
        const trialArgs = new Args();
        trialArgs.add(address);
        const trialData = await readContract('isInTrial', trialArgs);
        // Deserialize and set trial info
        setTrialInfo({
          inTrial: true,
          trialEnd: Date.now() + 3 * 24 * 60 * 60 * 1000, // Mock: 3 days remaining
        });
      }

      // Load subscriptions (mock for now)
      setSubscriptions([
        {
          creator: 'Tech Guru',
          tier: 'Supporter',
          nextBilling: Date.now() + 20 * 24 * 60 * 60 * 1000,
        },
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
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

  const trialDaysRemaining = trialInfo?.inTrial
    ? Math.ceil((trialInfo.trialEnd - Date.now()) / (24 * 60 * 60 * 1000))
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 gradient-text">Overview</h1>

      {/* Trial Status */}
      {trialInfo?.inTrial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl mb-6 border-2 border-purple-500/50"
        >
          <div className="flex items-center space-x-4">
            <Sparkles className="w-12 h-12 text-purple-400" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Free Trial Active</h3>
              <p className="text-white/70">
                {trialDaysRemaining} days remaining in your trial period
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">{trialDaysRemaining}</div>
              <div className="text-sm text-white/60">days left</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <CreditCard className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{subscriptions.length}</div>
          <div className="text-white/70">Active Subscriptions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">
            {subscriptions.reduce((sum, sub) => sum + 5, 0)}
          </div>
          <div className="text-white/70">Total Spent (MASSA)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl"
        >
          <Clock className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold mb-2">
            {subscriptions.length > 0
              ? formatDistanceToNow(new Date(subscriptions[0].nextBilling), { addSuffix: true })
              : 'N/A'}
          </div>
          <div className="text-white/70">Next Billing</div>
        </motion.div>
      </div>

      {/* Recent Subscriptions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-white/70">No active subscriptions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{sub.creator}</h3>
                    <p className="text-white/70">{sub.tier} Tier</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">Next billing</p>
                    <p className="text-lg font-semibold">
                      {formatDistanceToNow(new Date(sub.nextBilling), { addSuffix: true })}
                    </p>
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

