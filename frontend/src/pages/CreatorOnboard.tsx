import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';

export default function CreatorOnboard() {
  const navigate = useNavigate();
  const { address, connected } = useWallet();
  const { callContract } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    bio: '',
    category: 'tech',
    metadataURI: '',
  });

  if (!connected) {
    navigate('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const args = new Args();
      args.add(address);
      args.add(formData.name);
      args.add(formData.handle);
      args.add(formData.bio);
      args.add(formData.category);
      args.add(formData.metadataURI || '');

      await callContract('registerCreator', args);
      toast.success('Creator account created!');
      navigate('/dashboard/creator');
    } catch (error) {
      toast.error('Failed to create creator account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 gradient-text">Become a Creator</h1>
          <p className="text-white/70">Set up your creator profile and start monetizing your content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Creator Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your display name"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Handle</label>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              required
              placeholder="your-handle"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-sm text-white/60 mt-1">This will be your unique creator handle</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows={4}
              placeholder="Tell us about yourself and your content"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="tech" className="bg-slate-900">Tech</option>
              <option value="music" className="bg-slate-900">Music</option>
              <option value="art" className="bg-slate-900">Art</option>
              <option value="gaming" className="bg-slate-900">Gaming</option>
              <option value="education" className="bg-slate-900">Education</option>
              <option value="entertainment" className="bg-slate-900">Entertainment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metadata URI (Optional)</label>
            <input
              type="text"
              value={formData.metadataURI}
              onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
              placeholder="IPFS URI for profile metadata"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <User className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Creator Account'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

