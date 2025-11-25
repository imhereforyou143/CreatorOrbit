import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Args } from '@massalabs/massa-web3';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { parseBooleanResponse, parseContent } from '../utils/massa';

export default function ContentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useWallet();
  const { readContract } = useContract();
  const [content, setContent] = useState<ReturnType<typeof parseContent> | null>(null);
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ipfsUrl = useMemo(() => {
    if (!content?.contentCID) return '#';
    return `https://ipfs.io/ipfs/${content.contentCID}`;
  }, [content]);

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id, address]);

  const loadContent = async () => {
    setLoading(true);
    setError('');

    try {
      const contentArgs = new Args();
      contentArgs.addU64(BigInt(parseInt(id || '0')));
      const contentBytes = await readContract('getContent', contentArgs);

      if (!contentBytes) {
        setError('Content not found on-chain.');
        setContent(null);
        return;
      }

      const decoded = parseContent(contentBytes);
      setContent(decoded);

      if (address) {
        const accessArgs = new Args();
        accessArgs.addString(address);
        accessArgs.addU64(decoded.id);
        const accessBytes = await readContract('canViewContent', accessArgs);
        setCanView(parseBooleanResponse(accessBytes));
      } else {
        setCanView(decoded.visibility === 0);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load this content from the blockchain.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-center">
        <p className="text-white/70">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    );
  }

  const isLocked = content.visibility === 1 && !canView;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-2xl">
        {isLocked ? (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">This drop is locked</h2>
            <p className="text-white/70 mb-6">
              Subscribe to this creator to unlock premium content. You already discovered the track—now support the artist
              to access the full vibes.
            </p>
            <Link
              to={`/creator/${content.creator}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              Visit Creator Orbit
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 text-sm text-white/70">
              {content.visibility === 0 ? (
                <>
                  <Unlock className="w-5 h-5 text-green-400" /> Free Trial Content
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-yellow-400" /> Premium Content
                </>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <p className="text-white/70 mb-6">{content.description}</p>

            <div className="bg-black/30 p-6 rounded-2xl mb-6 space-y-3">
              <p className="text-white/90">
                Content CID: <span className="text-pink-300 font-mono break-all">{content.contentCID}</span>
              </p>
              <a
                href={ipfsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
              >
                Open on IPFS <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-xs text-white/50">
                Tip: For large media (audio/video), open in a new tab to stream directly from IPFS gateways.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(Number(content.createdAt)).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-white/10 capitalize">{content.contentType}</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

