import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const emails = {
      buyer: 'rajesh@kumartrading.in',
      seller: 'priya@sharmafurniture.in',
      admin: 'admin@settlex.in',
    };
    setEmail(emails[role]);
    setPassword('demo123');
    setLoading(true);
    try {
      await login(emails[role], 'demo123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
              <path d="M9 16.5L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Trust Every Deal.<br />
            Settle Every Milestone.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            SettleX is a Digital Escrow and Trust Platform for MSME Transactions. 
            Secure payments through milestone-based verification.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-sm">🔒</span>
              </div>
              <span className="text-sm">AI-powered evidence verification</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <span className="text-sm">Milestone-based escrow release</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-sm">⭐</span>
              </div>
              <span className="text-sm">Transparent trust scoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M9 16.5L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900">SettleX</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900">Welcome back</h2>
          <p className="text-surface-500 mt-1 mb-8">Sign in to your SettleX account</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm placeholder-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm placeholder-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-sm text-surface-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
              Create account
            </Link>
          </p>

          {/* Quick login for demo */}
          <div className="mt-8 pt-6 border-t border-surface-200">
            <p className="text-xs text-surface-400 text-center mb-3 uppercase tracking-wider font-medium">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'buyer', label: 'Buyer', desc: 'Rajesh Kumar' },
                { role: 'seller', label: 'Seller', desc: 'Priya Sharma' },
                { role: 'admin', label: 'Admin', desc: 'Platform Admin' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => quickLogin(item.role)}
                  className="p-3 rounded-lg border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-center cursor-pointer group"
                >
                  <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-700">{item.label}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
