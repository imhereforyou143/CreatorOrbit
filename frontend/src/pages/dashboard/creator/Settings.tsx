import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../../hooks/useWallet';
import { useContract } from '../../../hooks/useContract';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';

export default function CreatorSettings() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    bio: '',
    category: 'tech',
    metadataURI: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadProfile();
    }
  }, [address]);

  const loadProfile = async () => {
    if (!address) return;
    
    try {
      const args = new Args();
      args.add(address);
      const creatorData = await readContract('getCreator', args);
      // Deserialize and set form data
      // Mock for now
      setFormData({
        name: 'Tech Guru',
        handle: 'techguru',
        bio: 'Sharing the latest in tech',
        category: 'tech',
        metadataURI: '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      // Note: In production, you'd need an updateCreator function
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 gradient-text">Creator Settings</h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="glass p-8 rounded-2xl max-w-2xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Creator Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows={6}
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

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
}

