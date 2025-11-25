import { useState, useEffect } from 'react';
import { X, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useContract } from '../../../hooks/useContract';
import { useWallet } from '../../../hooks/useWallet';
import { parseCreator, parseSubscription } from '../../../utils/massa';
import { getUserSubscriptions, removeUserSubscription } from '../../../utils/localState';

type SubscriptionRow = {
  id: bigint;
  creator: string;
  handle: string;
  creatorAddress: string;
  tierLabel: string;
  tierId: bigint;
  nextBilling: number;
};

export default function UserSubscriptions() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadSubscriptions();
    }
  }, [address]);

  const loadSubscriptions = async () => {
    if (!address) return;
    setLoading(true);

    try {
      const handles = getUserSubscriptions(address);
      const rows: SubscriptionRow[] = [];

      for (const handle of handles) {
        try {
          const creatorArgs = new Args();
          creatorArgs.addString(handle);
          const creatorBytes = await readContract('getCreator', creatorArgs);
          if (!creatorBytes) continue;
          const creator = parseCreator(creatorBytes);

          const subArgs = new Args();
          subArgs.addString(address);
          subArgs.addString(creator.address);
          const subBytes = await readContract('getSubscription', subArgs);
          if (!subBytes) continue;

          const subscription = parseSubscription(subBytes);
          rows.push({
            id: subscription.id,
            creator: creator.name,
            handle: creator.handle,
            creatorAddress: creator.address,
            tierLabel: `Tier #${subscription.tierId}`,
            tierId: subscription.tierId,
            nextBilling: subscription.nextPaymentTime,
          });
        } catch (err) {
          console.warn('Failed to hydrate subscription', handle, err);
        }
      }

      setSubscriptions(rows);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (creatorAddress: string, handle: string) => {
    try {
      const args = new Args();
      args.addString(creatorAddress);
      await callContract('cancelSubscription', args);
      if (address) {
        removeUserSubscription(address, handle);
      }
      toast.success('Subscription cancelled');
      loadSubscriptions();
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error(error);
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
      <h1 className="text-3xl font-bold mb-8 gradient-text">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No active subscriptions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{sub.creator}</h3>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                        <span>{sub.tierLabel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Next billing: {formatDistanceToNow(new Date(sub.nextBilling), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(sub.creatorAddress, sub.handle)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition flex items-center space-x-2 text-red-400"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

