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
import CreateDeal from './pages/deals/CreateDeal';
import DealDetails from './pages/deals/DealDetails';

// Other screens
import Evidence from './pages/evidence/Evidence';
import Disputes from './pages/disputes/Disputes';
import TrustProfile from './pages/trust/TrustProfile';
import Transactions from './pages/transactions/Transactions';

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
        
        <Route path="/deals" element={<DealsList />} />
        <Route path="/deals/create" element={<CreateDeal />} />
        <Route path="/deals/:id" element={<DealDetails />} />
        
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/trust" element={<TrustProfile />} />
        <Route path="/transactions" element={<Transactions />} />
        
        {/* Mock Admin Routes */}
        <Route path="/admin/users" element={<div className="p-8">Admin Users Placeholder</div>} />
        <Route path="/escrow" element={<div className="p-8">Escrow Management Placeholder</div>} />
        <Route path="/analytics" element={<div className="p-8">Trust Analytics Placeholder</div>} />
        <Route path="/admin/audit" element={<div className="p-8">Audit Logs Placeholder</div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
}
