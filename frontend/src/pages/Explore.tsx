import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Creator {
  address: string;
  name: string;
  handle: string;
  bio: string;
  category: string;
}

export default function Explore() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'tech', 'music', 'art', 'gaming', 'education', 'entertainment'];

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    // In production, you'd fetch from contract or indexer
    // For now, using mock data
    setLoading(false);
    setCreators([
      {
        address: 'AS123...',
        name: 'Tech Guru',
        handle: 'techguru',
        bio: 'Sharing the latest in tech',
        category: 'tech',
      },
      {
        address: 'AS456...',
        name: 'Music Master',
        handle: 'musicmaster',
        bio: 'Original music and beats',
        category: 'music',
      },
    ]);
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.handle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 gradient-text">Explore Creators</h1>
        <p className="text-white/70">Discover amazing creators and their content</p>
      </motion.div>

      {/* Search and Filter */}
      <div className="glass p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/50" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">No creators found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator, index) => (
            <motion.div
              key={creator.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/creator/${creator.handle}`}>
                <div className="glass p-6 rounded-2xl card-hover h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{creator.name}</h3>
                  <p className="text-purple-400 text-sm mb-2">@{creator.handle}</p>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{creator.bio}</p>
                  <span className="inline-block px-3 py-1 bg-purple-600/20 rounded-full text-xs text-purple-300">
                    {creator.category}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

