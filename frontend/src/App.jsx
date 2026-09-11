import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import DashboardRouter from './pages/dashboard/DashboardRouter';

// Deals
import DealsList from './pages/deals/DealsList';
import IncomingDeals from './pages/deals/IncomingDeals';
import ActiveDeals from './pages/deals/ActiveDeals';
import CreateDeal from './pages/deals/CreateDeal';
import DealDetails from './pages/deals/DealDetails';

// Domain Modules
import Evidence from './pages/evidence/Evidence';
import Disputes from './pages/disputes/Disputes';
import TrustProfile from './pages/trust/TrustProfile';
import Transactions from './pages/transactions/Transactions';

// Admin Modules
import AdminUsers from './pages/admin/AdminUsers';
import AdminEscrow from './pages/admin/AdminEscrow';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAudit from './pages/admin/AdminAudit';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRouter />} />
        
        {/* Deal routes — Specific paths MUST precede :id */}
        <Route path="/deals" element={<DealsList />} />
        <Route path="/deals/incoming" element={<IncomingDeals />} />
        <Route path="/deals/active" element={<ActiveDeals />} />
        <Route path="/deals/create" element={<CreateDeal />} />
        <Route path="/deals/:id" element={<DealDetails />} />
        
        {/* Domain features */}
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/trust" element={<TrustProfile />} />
        <Route path="/transactions" element={<Transactions />} />
        
        {/* Admin features */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
        <Route path="/escrow" element={<AdminEscrow />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center text-surface-500">404 - Page Not Found</div>} />
    </Routes>
  );
}
