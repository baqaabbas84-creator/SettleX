import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
    company: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            Join the Trust Network
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Create an account to start dealing with confidence.
          </p>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M9 16.5L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900">SettleX</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900">Create an account</h2>
          <p className="text-surface-500 mt-1 mb-8">Start settling milestones securely</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.role === 'BUYER' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                <input type="radio" name="role" value="BUYER" checked={formData.role === 'BUYER'} onChange={handleChange} className="hidden" />
                <div className="text-center">
                  <p className={`font-semibold ${formData.role === 'BUYER' ? 'text-brand-700' : 'text-surface-700'}`}>Buyer</p>
                </div>
              </label>
              <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.role === 'SELLER' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                <input type="radio" name="role" value="SELLER" checked={formData.role === 'SELLER'} onChange={handleChange} className="hidden" />
                <div className="text-center">
                  <p className={`font-semibold ${formData.role === 'SELLER' ? 'text-brand-700' : 'text-surface-700'}`}>Seller</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Rajesh Kumar" className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Company / Business Name</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Kumar Trading Co." className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number (Optional)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="rajesh@kumartrading.in" className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm pr-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-sm text-surface-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
