import { useState, useEffect } from 'react';
import { Users, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../../../hooks/useContract';
import { useWallet } from '../../../hooks/useWallet';
import { formatDistanceToNow } from 'date-fns';

export default function CreatorSubscribers() {
  const { address } = useWallet();
  const { readContract } = useContract();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadSubscribers();
    }
  }, [address]);

  const loadSubscribers = async () => {
    setLoading(true);
    // Mock data for now
    setSubscribers([
      {
        address: 'AS123...',
        tier: 'Supporter',
        subscribedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        nextBilling: Date.now() + 5 * 24 * 60 * 60 * 1000,
      },
    ]);
    setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8 gradient-text">Subscribers</h1>

      {subscribers.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No subscribers yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscribers.map((sub, index) => (
            <motion.div
              key={sub.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{sub.address}</h3>
                    <div className="flex items-center space-x-4 text-sm text-white/70 mt-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{sub.tier}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Subscribed {formatDistanceToNow(new Date(sub.subscribedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
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
  );
}

