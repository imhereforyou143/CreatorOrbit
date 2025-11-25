import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';
import { useWallet } from '../../../hooks/useWallet';
import { useContract } from '../../../hooks/useContract';
import { parseUser } from '../../../utils/massa';

export default function UserSettings() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
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
      args.addString(address);
      const userData = await readContract('getUser', args);
      if (userData) {
        const decoded = parseUser(userData);
        setFormData({
          username: decoded.username,
          bio: decoded.bio,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const args = new Args();
      args.addString(address);
      args.addString(formData.username);
      args.addString(formData.bio);
      await callContract('updateUserProfile', args);
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
      <h1 className="text-3xl font-bold mb-8 gradient-text">Settings</h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="glass p-8 rounded-2xl max-w-2xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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

