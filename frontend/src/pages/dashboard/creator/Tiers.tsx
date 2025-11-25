import { useState, useEffect } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../../../hooks/useContract';
import { useWallet } from '../../../hooks/useWallet';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';
import { parseTierList } from '../../../utils/massa';

export default function CreatorTiers() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [tiers, setTiers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pricePerMonth: '',
    metadataURI: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadTiers();
    }
  }, [address]);

  const loadTiers = async () => {
    if (!address) return;
    
    try {
      const args = new Args();
      args.addString(address);
      const tiersData = await readContract('getCreatorTiers', args);
      setTiers(parseTierList(tiersData));
    } catch (error) {
      console.error('Error loading tiers:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const priceInNano = BigInt(parseFloat(formData.pricePerMonth) * 1e9);
      const args = new Args();
      args.addString(address);
      args.addString(formData.name);
      args.addU64(priceInNano);
      args.addString(formData.metadataURI || '');

      await callContract('createTier', args);
      toast.success('Tier created!');
      setShowModal(false);
      setFormData({ name: '', pricePerMonth: '', metadataURI: '' });
      loadTiers();
    } catch (error) {
      toast.error('Failed to create tier');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Subscription Tiers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Tier</span>
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-white/70 text-lg mb-4">No tiers created yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Create Your First Tier
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl card-hover"
            >
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-3xl font-bold text-purple-400 mb-4">
                {(Number(tier.pricePerMonth) / 1e9).toFixed(2)} MASSA
              </p>
              <p className="text-white/70 text-sm">per month</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Create Tier</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tier Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Supporter, Super Fan"
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price per Month (MASSA)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Metadata URI (Optional)</label>
                <input
                  type="text"
                  value={formData.metadataURI}
                  onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
                  placeholder="IPFS URI for tier metadata"
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 glass rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

