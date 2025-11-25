import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Receipt, Settings } from 'lucide-react';

export default function UserDashboard() {
  const navItems = [
    { to: 'overview', label: 'Overview', icon: LayoutDashboard },
    { to: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: 'billing', label: 'Billing', icon: Receipt },
    { to: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64">
          <div className="glass p-6 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-6 gradient-text">User Dashboard</h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

