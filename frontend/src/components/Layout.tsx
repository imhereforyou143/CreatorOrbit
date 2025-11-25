import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { Menu, X, User, LogOut, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { connected, account, disconnect } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold gradient-text">CreatorOrbit</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/explore" className="text-white/80 hover:text-white transition">
                Explore
              </Link>
              {connected && (
                <>
                  <Link to="/dashboard/user" className="text-white/80 hover:text-white transition">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => navigate('/creator/onboard')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Become Creator
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {connected ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="text-white/80">
                      {account?.address().slice(0, 6)}...{account?.address().slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 px-4 py-2 glass rounded-lg hover:bg-white/20 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Disconnect</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                  Connect Wallet
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/explore"
                className="block text-white/80 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              {connected && (
                <>
                  <Link
                    to="/dashboard/user"
                    className="block text-white/80 hover:text-white transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      navigate('/creator/onboard');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Become Creator
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}

