import { useState, useEffect } from 'react';
import { Sparkles, Clock, CreditCard, TrendingUp, Rss } from 'lucide-react';
import { motion } from 'framer-motion';
import { Args } from '@massalabs/massa-web3';
import { formatDistanceToNow } from 'date-fns';
import { useWallet } from '../../../hooks/useWallet';
import { useContract } from '../../../hooks/useContract';
import {
  formatMassa,
  parseContentList,
  parseCreator,
  parseSubscription,
  parseUser,
} from '../../../utils/massa';
import { getUserSubscriptions } from '../../../utils/localState';

type SubscriptionCard = {
  creator: string;
  handle: string;
  tierLabel: string;
  nextBilling: number;
  amount: bigint;
};

export default function UserOverview() {
  const { address } = useWallet();
  const { readContract } = useContract();
  const [trialInfo, setTrialInfo] = useState<{ inTrial: boolean; trialEnd: number }>({
    inTrial: false,
    trialEnd: 0,
  });
  const [subscriptions, setSubscriptions] = useState<SubscriptionCard[]>([]);
  const [recentDrops, setRecentDrops] = useState<
    { title: string; creator: string; cid: string; createdAt: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadUserData();
    }
  }, [address]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (!address) return;

      const userArgs = new Args();
      userArgs.addString(address);
      const userBytes = await readContract('getUser', userArgs);

      if (userBytes) {
        const decodedUser = parseUser(userBytes);
        setTrialInfo({
          inTrial: decodedUser.isNew && Date.now() < decodedUser.trialEndTimestamp,
          trialEnd: decodedUser.trialEndTimestamp,
        });
      }

      const handles = getUserSubscriptions(address);
      const subscriptionsData: SubscriptionCard[] = [];
      const drops: { title: string; creator: string; cid: string; createdAt: number }[] = [];

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
          subscriptionsData.push({
            creator: creator.name,
            handle: creator.handle,
            tierLabel: `Tier #${subscription.tierId}`,
            nextBilling: subscription.nextPaymentTime,
            amount: subscription.totalPaid,
          });

          const contentArgs = new Args();
          contentArgs.addString(creator.address);
          const contentBytes = await readContract('getCreatorContent', contentArgs);
          const contentList = parseContentList(contentBytes);
          if (contentList.length > 0) {
            const latest = contentList[0];
            drops.push({
              title: latest.title,
              creator: creator.name,
              cid: latest.contentCID,
              createdAt: Number(latest.createdAt),
            });
          }
        } catch (err) {
          console.warn('Unable to hydrate subscription for', handle, err);
        }
      }

      setSubscriptions(subscriptionsData);
      setRecentDrops(drops.slice(0, 3));
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

  const trialDaysRemaining = trialInfo.inTrial
    ? Math.max(0, Math.ceil((trialInfo.trialEnd - Date.now()) / (24 * 60 * 60 * 1000)))
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
            {formatMassa(
              subscriptions.reduce((sum, sub) => sum + sub.amount, BigInt(0)),
              2,
            )}
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
                    <p className="text-white/70">{sub.tierLabel}</p>
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

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Rss className="w-5 h-5 text-pink-300" /> Latest Drops from Your Creators
        </h2>
        {recentDrops.length === 0 ? (
          <div className="glass p-10 rounded-2xl text-center text-white/60">
            Subscribe to your first creator to see their drops right here.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div key={`${drop.cid}-${drop.createdAt}`} className="glass p-5 rounded-2xl space-y-2">
                <p className="text-sm uppercase tracking-widest text-white/40">New drop</p>
                <p className="text-lg font-semibold">{drop.title}</p>
                <p className="text-white/60 text-sm">by {drop.creator}</p>
                <p className="text-xs text-white/50">
                  {formatDistanceToNow(new Date(drop.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

