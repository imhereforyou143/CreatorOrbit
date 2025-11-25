import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useContract } from '../../hooks/useContract';
import { Sparkles, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Args } from '@massalabs/massa-web3';

export default function Signup() {
  const { connect, connected, address } = useWallet();
  const { callContract } = useContract();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
  });

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
      toast.success('Wallet connected!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const args = new Args();
      args.addString(address);
      args.addString(formData.username);
      args.addString(formData.bio);

      await callContract('registerUser', args);
      toast.success('Account created! Starting your 7-day trial...');
      navigate('/explore');
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 gradient-text">Join CreatorOrbit</h1>
          <p className="text-white/70">Create your account and start your 7-day free trial</p>
        </div>

        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Wallet className="w-5 h-5" />
            <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <User className="w-5 h-5" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-purple-400 hover:text-purple-300">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

