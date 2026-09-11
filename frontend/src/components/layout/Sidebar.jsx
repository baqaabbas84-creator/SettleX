import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Handshake,
  PlusCircle,
  Receipt,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Lock,
  BarChart3,
  ClipboardList,
  InboxIcon,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';

const BUYER_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Deals', path: '/deals', icon: Handshake },
  { label: 'Create Deal', path: '/deals/create', icon: PlusCircle },
  { label: 'Active Deals', path: '/deals/active', icon: CheckSquare },
  { label: 'Transactions', path: '/transactions', icon: Receipt },
  { label: 'Disputes', path: '/disputes', icon: AlertTriangle },
  { label: 'Trust Profile', path: '/trust', icon: Shield },
];

const SELLER_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Incoming Deals', path: '/deals/incoming', icon: InboxIcon },
  { label: 'Active Deals', path: '/deals/active', icon: Handshake },
  { label: 'Evidence', path: '/evidence', icon: FileText },
  { label: 'Transactions', path: '/transactions', icon: Receipt },
  { label: 'Disputes', path: '/disputes', icon: AlertTriangle },
  { label: 'Trust Profile', path: '/trust', icon: Shield },
];

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Deals', path: '/deals', icon: Handshake },
  { label: 'Escrow', path: '/escrow', icon: Lock },
  { label: 'Disputes', path: '/disputes', icon: AlertTriangle },
  { label: 'Evidence', path: '/evidence', icon: FileText },
  { label: 'Trust Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Audit Logs', path: '/admin/audit', icon: ClipboardList },
];

function getNavItems(role) {
  switch (role) {
    case 'SELLER': return SELLER_NAV;
    case 'ADMIN': return ADMIN_NAV;
    default: return BUYER_NAV;
  }
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-surface-900 text-white z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-700/50 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
            <path d="M9 16.5L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold tracking-tight">SettleX</h1>
            <p className="text-[10px] text-surface-400 -mt-0.5">Trust Every Deal</p>
          </div>
        )}
      </div>

      {/* Role indicator */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-surface-700/50">
          <p className="text-xs text-surface-400">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300">
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 font-medium'
                      : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Demo Role Switcher */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-surface-700/50">
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-2 px-1">Demo: Switch Role</p>
          <div className="flex gap-1">
            {['BUYER', 'SELLER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  navigate('/dashboard');
                }}
                className={`flex-1 px-2 py-1.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  user?.role === role
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="border-t border-surface-700/50 p-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:bg-surface-800 hover:text-white transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-700 border-2 border-surface-900 flex items-center justify-center text-surface-400 hover:text-white transition-colors cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
