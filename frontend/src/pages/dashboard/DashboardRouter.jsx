import { useAuth } from '../../context/AuthContext';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'SELLER':
      return <SellerDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'BUYER':
    default:
      return <BuyerDashboard />;
  }
}
