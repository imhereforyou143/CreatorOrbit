import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Unlock,
  Users,
  Flame,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import {
  formatMassa,
  parseBooleanResponse,
  parseContentList,
  parseCreator,
  parseFreeTrialCount,
  parseTierList,
} from '../utils/massa';
import {
  addCreatorFollower,
  addUserSubscription,
  getCreatorFollowers,
  getUserSubscriptions,
  removeCreatorFollower,
  removeUserSubscription,
} from '../utils/localState';

const visibilityLabels = ['Free Trial', 'Subscribers Only'];

export default function CreatorProfile() {
  const { handle } = useParams();
  const { address, connected } = useWallet();
  const { readContract, callContract } = useContract();

  const [creator, setCreator] = useState<ReturnType<typeof parseCreator> | null>(null);
  const [tiers, setTiers] = useState<ReturnType<typeof parseTierList>>([]);
  const [freeTrialCount, setFreeTrialCount] = useState(0);
  const [contents, setContents] = useState<ReturnType<typeof parseContentList>>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localVersion, setLocalVersion] = useState(0);

  const followers = useMemo(
    () => (creator ? getCreatorFollowers(creator.address) : []),
    [creator, localVersion],
  );

  const userSubscriptions = useMemo(
    () => getUserSubscriptions(address || null),
    [address, localVersion],
  );

  useEffect(() => {
    if (handle) {
      loadCreatorData(handle);
    }
  }, [handle, address]);

  const loadCreatorData = async (identifier: string) => {
    setLoading(true);
    setError('');

    try {
      const creatorArgs = new Args();
      creatorArgs.addString(identifier);
      const creatorData = await readContract('getCreator', creatorArgs);

      if (!creatorData) {
        setError('Creator not found on-chain. Ask them to onboard first!');
        setCreator(null);
        setContents([]);
        return;
      }

      const decodedCreator = parseCreator(creatorData);
      setCreator(decodedCreator);

      const tiersArgs = new Args();
      tiersArgs.addString(decodedCreator.address);
      const tierBytes = await readContract('getCreatorTiers', tiersArgs);
      setTiers(parseTierList(tierBytes));

      const freeTrialArgs = new Args();
      freeTrialArgs.addString(decodedCreator.address);
      const freeTrialBytes = await readContract('getFreeTrialCount', freeTrialArgs);
      setFreeTrialCount(parseFreeTrialCount(freeTrialBytes));

      const contentArgs = new Args();
      contentArgs.addString(decodedCreator.address);
      const contentBytes = await readContract('getCreatorContent', contentArgs);
      setContents(parseContentList(contentBytes));

      if (address) {
        const subArgs = new Args();
        subArgs.addString(address);
        subArgs.addString(decodedCreator.address);
        subArgs.addU64(0n);
        const result = await readContract('isSubscribed', subArgs);
        setIsSubscribed(parseBooleanResponse(result));
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load creator profile from the blockchain.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: bigint) => {
    if (!connected || !address || !creator) {
      toast.error('Please connect your wallet first.');
      return;
    }

    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) {
      toast.error('Tier not found');
      return;
    }

    try {
      const args = new Args();
      args.addString(creator.address);
      args.addU64(tierId);
      await callContract('subscribe', args, tier.pricePerMonth);
      addUserSubscription(address, creator.handle);
      addCreatorFollower(creator.address, address);
      toast.success(Welcome to 's  tier!);
      setIsSubscribed(true);
      setLocalVersion((v) => v + 1);
    } catch (err) {
      console.error(err);
      toast.error('Subscription failed. Please retry.');
    }
  };

  const handleCancel = async () => {
    if (!address || !creator) return;

    try {
      const args = new Args();
      args.addString(creator.address);
      await callContract('cancelSubscription', args);
      removeUserSubscription(address, creator.handle);
      removeCreatorFollower(creator.address, address);
      setIsSubscribed(false);
      setLocalVersion((v) => v + 1);
      toast.success('Subscription cancelled.');
    } catch (err) {
      console.error(err);
      toast.error('Unable to cancel subscription.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="glass p-12 rounded-3xl text-center">
          <p className="text-lg text-white/70 animate-pulse">Fetching creator orbit…</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="glass p-10 rounded-3xl text-center space-y-4">
          <Sparkles className="w-12 h-12 text-pink-400 mx-auto" />
          <p className="text-xl font-semibold gradient-text">Oops!</p>
          <p className="text-white/70">{error}</p>
          <Link
            to="/explore"
            className="inline-flex px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 font-semibold"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const freeContent = contents.filter((item) => item.visibility === 0);
  const premiumContent = contents.filter((item) => item.visibility === 1);

  return (
    <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-3xl -z-10">
        <div className="w-64 h-64 bg-purple-500/40 rounded-full absolute -top-10 -left-10 animate-float" />
        <div className="w-72 h-72 bg-sky-500/30 rounded-full absolute bottom-0 right-0 animate-float delay-300" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-sky-500 flex items-center justify-center shadow-xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <span className="absolute -bottom-3 -right-2 px-3 py-1 text-xs rounded-full bg-black/60 text-white">
              +{followers.length} orbiters
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-black gradient-text">{creator.name}</h1>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm">@{creator.handle}</span>
            </div>
            <p className="text-white/80 leading-relaxed">{creator.bio}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-100">
                <Flame className="w-4 h-4" /> {creator.category}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-100">
                <ShieldCheck className="w-4 h-4" /> {userSubscriptions.includes(creator.handle) ? 'In Orbit' : 'Visitor'}
              </span>
            </div>
          </div>
        </div>

        {tiers.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id.toString()}
                className="glass-dark rounded-2xl p-5 border border-white/5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{tier.name}</h3>
                    <p className="text-sm text-white/60">
                      since {new Date(Number(tier.createdAt)).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-pink-300">{formatMassa(tier.pricePerMonth, 2)}</p>
                </div>
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={isSubscribed}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 py-3 font-semibold disabled:opacity-60"
                >
                  {isSubscribed ? 'You are subscribed' : Join }
                </button>
              </div>
            ))}
          </div>
        )}

        {isSubscribed && (
          <button
            onClick={handleCancel}
            className="w-full md:w-auto px-6 py-3 rounded-full bg-black/50 border border-white/10 text-sm"
          >
            Cancel Subscription
          </button>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 space-y-10"
      >
        <div className="flex items-center gap-3">
          <Waves className="w-6 h-6 text-sky-300" />
          <h2 className="text-2xl font-bold">Free Trial Nebula ({freeTrialCount}/3 slots used)</h2>
        </div>
        {freeContent.length === 0 ? (
          <div className="glass p-8 rounded-2xl text-center text-white/70">No free trial content yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {freeContent.map((item) => (
              <Link key={item.id.toString()} to={/content/}>
                <motion.div whileHover={{ y: -6 }} className="glass-dark p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-green-300 text-sm mb-3">
                    <Unlock className="w-4 h-4" /> Free Trial
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/70">{item.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-12">
          <Lock className="w-6 h-6 text-yellow-300" />
          <h2 className="text-2xl font-bold">Premium Vault</h2>
        </div>
        {premiumContent.length === 0 ? (
          <div className="glass p-8 rounded-2xl text-center text-white/70">No premium drops yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {premiumContent.map((item) => (
              <div key={item.id.toString()} className="relative">
                <div
                  className={glass-dark p-6 rounded-2xl border border-white/5 }
                >
                  <div className="flex items-center gap-2 text-yellow-300 text-sm mb-3">
                    <Lock className="w-4 h-4" /> Subscribers Only
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/70 line-clamp-3">
                    {isSubscribed ? item.description : 'Subscribe to reveal the full cosmic drop'}
                  </p>
                </div>
                {!isSubscribed && (
                  <div className="absolute inset-0 rounded-2xl border border-dashed border-white/10 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 items-center">
          <Users className="w-12 h-12 text-pink-300" />
          <div className="flex-1 space-y-2">
            <p className="text-sm uppercase tracking-widest text-white/50">Creator Orbit</p>
            <h3 className="text-2xl font-semibold">Fans inside this orbit</h3>
            <p className="text-white/70">
              Followers recorded locally on this device. Once the public indexer ships, this panel will sync with
              on-chain analytics automatically.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black gradient-text">{followers.length}</p>
            <p className="text-sm text-white/60">local orbiters</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
