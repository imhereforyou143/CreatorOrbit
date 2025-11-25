import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Args } from '@massalabs/massa-web3';

export default function ContentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useWallet();
  const { readContract } = useContract();
  const [content, setContent] = useState<any>(null);
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id, address]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Load content
      const contentArgs = new Args();
      contentArgs.addU64(BigInt(parseInt(id || '0')));
      await readContract('getContent', contentArgs);
      
      // Check access
      if (address) {
        const accessArgs = new Args();
        accessArgs.addString(address);
        accessArgs.addU64(BigInt(parseInt(id || '0')));
        await readContract('canViewContent', accessArgs);
        // Deserialize access result
        setCanView(true); // Simplified
      }

      // Mock content for now
      setContent({
        id: parseInt(id || '0'),
        title: 'Sample Content',
        description: 'This is sample content',
        visibility: 0,
        contentCID: 'QmSample',
        contentType: 'post',
      });
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  const isLocked = content?.visibility === 1 && !canView;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl"
      >
        {isLocked ? (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">This Content is Locked</h2>
            <p className="text-white/70 mb-6">
              Subscribe to this creator to unlock premium content
            </p>
            <Link
              to={`/creator/${content?.creatorHandle || ''}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              Subscribe Now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 mb-4">
              {content?.visibility === 0 ? (
                <Unlock className="w-5 h-5 text-green-400" />
              ) : (
                <Lock className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-sm text-white/70">
                {content?.visibility === 0 ? 'Free Trial Content' : 'Premium Content'}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{content?.title}</h1>
            <p className="text-white/70 mb-6">{content?.description}</p>

            <div className="bg-black/30 p-6 rounded-lg mb-6">
              <p className="text-white/90">
                Content loaded from IPFS: {content?.contentCID}
              </p>
              <p className="text-sm text-white/60 mt-2">
                In production, this would fetch and display the actual content from IPFS
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Published recently</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

