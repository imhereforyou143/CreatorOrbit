import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeDBackground from '../components/ThreeDBackground';
import { useWallet } from '../hooks/useWallet';

export default function Landing() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeDBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-20 h-20 text-purple-400 mx-auto" />
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">CreatorOrbit</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/80 mb-4">
              Autonomous subscriptions for unstoppable creators
            </p>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-12">
              Built on Massa blockchain. No bots, no cron jobs, no backend needed.
              Your content, your rules, your earnings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {connected ? (
                <>
                  <Link
                    to="/explore"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2"
                  >
                    <span>Explore Creators</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dashboard/user"
                    className="px-8 py-4 glass rounded-lg text-lg font-semibold hover:bg-white/20 transition"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/signup"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/auth/login"
                    className="px-8 py-4 glass rounded-lg text-lg font-semibold hover:bg-white/20 transition"
                  >
                    Connect Wallet
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            Why CreatorOrbit?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-2xl card-hover"
            >
              <Zap className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Autonomous Billing</h3>
              <p className="text-white/70">
                Smart contracts handle all subscriptions automatically. No manual intervention needed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass p-8 rounded-2xl card-hover"
            >
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Fully Decentralized</h3>
              <p className="text-white/70">
                Built on Massa blockchain. Your content, your data, your control. No central authority.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass p-8 rounded-2xl card-hover"
            >
              <Globe className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">DeWeb Hosted</h3>
              <p className="text-white/70">
                Frontend deployed on Massa DeWeb. Truly unstoppable and censorship-resistant.
              </p>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl text-center"
          >
            <h2 className="text-4xl font-bold mb-6 gradient-text">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join creators and fans in the decentralized future of content monetization.
            </p>
            {!connected && (
              <Link
                to="/auth/signup"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
              >
                Create Account
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

