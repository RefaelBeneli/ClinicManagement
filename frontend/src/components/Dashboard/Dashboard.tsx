// For now, let's use the original Dashboard with our new layout
import OriginalDashboard from '../Dashboard';
import DashboardLayout from './DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <OriginalDashboard />
    </DashboardLayout>
  );
};

export default Dashboard; 