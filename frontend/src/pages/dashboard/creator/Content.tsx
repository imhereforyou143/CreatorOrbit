import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContract } from '../../../hooks/useContract';
import { useWallet } from '../../../hooks/useWallet';
import { Args } from '@massalabs/massa-web3';
import toast from 'react-hot-toast';

export default function CreatorContent() {
  const { address } = useWallet();
  const { readContract, callContract } = useContract();
  const [content, setContent] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'post',
    visibility: 1,
    contentCID: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadContent();
    }
  }, [address]);

  const loadContent = async () => {
    if (!address) return;
    
    try {
      const args = new Args();
      args.addString(address);
      await readContract('getCreatorContent', args);
      // Deserialize and set
      // Mock for now
      setContent([
        {
          id: 0,
          title: 'Sample Post',
          description: 'This is a sample post',
          visibility: 0,
          contentType: 'post',
        },
      ]);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const args = new Args();
      args.addString(address);
      args.addU64(0n); // tierIdRequired (0 = none)
      args.addU8(BigInt(formData.visibility));
      args.addString(formData.contentCID || 'QmSample');
      args.addString(formData.title);
      args.addString(formData.description);
      args.addString(formData.contentType);

      await callContract('createContent', args);
      toast.success('Content created!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        contentType: 'post',
        visibility: 1,
        contentCID: '',
      });
      loadContent();
    } catch (error) {
      toast.error('Failed to create content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const args = new Args();
      args.addU64(BigInt(contentId));
      await callContract('deleteContent', args);
      toast.success('Content deleted');
      loadContent();
    } catch (error) {
      toast.error('Failed to delete content');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Content Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Content</span>
        </button>
      </div>

      {content.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <p className="text-white/70 text-lg mb-4">No content yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Create Your First Content
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                {item.visibility === 0 ? (
                  <Unlock className="w-5 h-5 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-yellow-400" />
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{item.description}</p>
              <span className="inline-block px-2 py-1 bg-purple-600/20 rounded text-xs text-purple-300">
                {item.contentType}
              </span>
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
            className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Create Content</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="post" className="bg-slate-900">Post</option>
                  <option value="video" className="bg-slate-900">Video</option>
                  <option value="audio" className="bg-slate-900">Audio</option>
                  <option value="file" className="bg-slate-900">File</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0} className="bg-slate-900">Free Trial (Max 3)</option>
                  <option value={1} className="bg-slate-900">Subscribers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IPFS Content CID</label>
                <input
                  type="text"
                  value={formData.contentCID}
                  onChange={(e) => setFormData({ ...formData, contentCID: e.target.value })}
                  placeholder="Qm..."
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-white/60 mt-1">
                  Upload your content to IPFS and paste the CID here
                </p>
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

