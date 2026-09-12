import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 w-72">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search deals, transactions..."
            className="bg-transparent border-none outline-none text-sm text-surface-700 placeholder-surface-400 w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Demo badge */}
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-warning-50 text-warning-700 text-xs font-medium border border-warning-200">
          ⚡ Demo Mode
        </span>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-surface-200">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-surface-500 leading-tight">{user?.company}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
