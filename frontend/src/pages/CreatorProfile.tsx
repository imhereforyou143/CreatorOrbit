import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Lock, Unlock, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';

interface Tier {
  id: number;
  name: string;
  pricePerMonth: bigint;
  metadataURI: string;
}

interface Content {
  id: number;
  title: string;
  description: string;
  visibility: number;
  contentCID: string;
}

export default function CreatorProfile() {
  const { handle } = useParams();
  const { address, connected } = useWallet();
  const { readContract, callContract } = useContract();
  const [creator, setCreator] = useState<any>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (handle) {
      loadCreatorData();
    }
  }, [handle, address]);

  const loadCreatorData = async () => {
    setLoading(true);
    try {
      // Load creator profile
      const creatorArgs = new Args();
      creatorArgs.add(handle || '');
      const creatorData = await readContract('getCreator', creatorArgs);
      if (creatorData) {
        // Deserialize creator data
        // For now, using mock data
        setCreator({
          name: 'Tech Guru',
          handle: handle,
          bio: 'Sharing the latest in technology and innovation',
          category: 'tech',
        });
      }

      // Load tiers
      const tiersArgs = new Args();
      tiersArgs.add(creator?.address || '');
      const tiersData = await readContract('getCreatorTiers', tiersArgs);
      // Deserialize and set tiers
      setTiers([
        { id: 0, name: 'Supporter', pricePerMonth: BigInt(5000000000), metadataURI: '' },
        { id: 1, name: 'Super Fan', pricePerMonth: BigInt(15000000000), metadataURI: '' },
      ]);

      // Load content
      const contentArgs = new Args();
      contentArgs.add(creator?.address || '');
      const contentData = await readContract('getCreatorContent', contentArgs);
      // Deserialize and set content
      setContent([
        { id: 0, title: 'Free Tutorial', description: 'Learn the basics', visibility: 0, contentCID: 'Qm...' },
        { id: 1, title: 'Premium Course', description: 'Advanced techniques', visibility: 1, contentCID: 'Qm...' },
      ]);
    } catch (error) {
      console.error('Error loading creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: number) => {
    if (!connected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const args = new Args();
      args.add(creator?.address || '');
      args.add(tierId);
      await callContract('subscribe', args);
      toast.success('Subscribed successfully!');
      setSubscribed(true);
    } catch (error) {
      toast.error('Failed to subscribe');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Creator Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl mb-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{creator?.name}</h1>
            <p className="text-purple-400 mb-2">@{creator?.handle}</p>
            <p className="text-white/70 mb-4">{creator?.bio}</p>
            <span className="inline-block px-3 py-1 bg-purple-600/20 rounded-full text-sm text-purple-300">
              {creator?.category}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Subscription Tiers */}
      {tiers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Subscription Tiers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="glass p-6 rounded-2xl card-hover">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-purple-400 mb-4">
                  {(Number(tier.pricePerMonth) / 1e9).toFixed(2)} MASSA
                </p>
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={subscribed}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 gradient-text">Content</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Link key={item.id} to={`/content/${item.id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass p-6 rounded-2xl card-hover h-full"
              >
                {item.visibility === 0 ? (
                  <Unlock className="w-6 h-6 text-green-400 mb-2" />
                ) : (
                  <Lock className="w-6 h-6 text-yellow-400 mb-2" />
                )}
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm line-clamp-2">{item.description}</p>
                {item.visibility === 0 && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-600/20 rounded text-xs text-green-300">
                    Free Trial
                  </span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

