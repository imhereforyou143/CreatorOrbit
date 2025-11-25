import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Explore from './pages/Explore';
import CreatorProfile from './pages/CreatorProfile';
import ContentView from './pages/ContentView';
import OrbitStories from './pages/OrbitStories';
import UserDashboard from './pages/dashboard/UserDashboard';
import UserOverview from './pages/dashboard/user/Overview';
import UserSubscriptions from './pages/dashboard/user/Subscriptions';
import UserBilling from './pages/dashboard/user/Billing';
import UserSettings from './pages/dashboard/user/Settings';
import CreatorDashboard from './pages/dashboard/CreatorDashboard';
import CreatorOverview from './pages/dashboard/creator/Overview';
import CreatorContent from './pages/dashboard/creator/Content';
import CreatorSubscribers from './pages/dashboard/creator/Subscribers';
import CreatorTiers from './pages/dashboard/creator/Tiers';
import CreatorPayouts from './pages/dashboard/creator/Payouts';
import CreatorSettings from './pages/dashboard/creator/Settings';
import CreatorOnboard from './pages/CreatorOnboard';
import { useWallet } from './hooks/useWallet';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/explore" element={<Layout><Explore /></Layout>} />
          <Route path="/creator/:handle" element={<Layout><CreatorProfile /></Layout>} />
          <Route path="/content/:id" element={<Layout><ContentView /></Layout>} />
          <Route path="/stories" element={<Layout><OrbitStories /></Layout>} />
          <Route path="/creator/onboard" element={<ProtectedRoute><Layout><CreatorOnboard /></Layout></ProtectedRoute>} />
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard/user" element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<UserOverview />} />
            <Route path="subscriptions" element={<UserSubscriptions />} />
            <Route path="billing" element={<UserBilling />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
          
          {/* Creator Dashboard Routes */}
          <Route path="/dashboard/creator" element={<ProtectedRoute><Layout><CreatorDashboard /></Layout></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CreatorOverview />} />
            <Route path="content" element={<CreatorContent />} />
            <Route path="subscribers" element={<CreatorSubscribers />} />
            <Route path="tiers" element={<CreatorTiers />} />
            <Route path="payouts" element={<CreatorPayouts />} />
            <Route path="settings" element={<CreatorSettings />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  
  if (!connected) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

export default App;
