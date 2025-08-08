import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedAdminPanelIntegrated from './EnhancedAdminPanelIntegrated';
import TherapistPanel from './TherapistPanel';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  // Check if user is admin (role === 'ADMIN')
  if (user?.role === 'ADMIN') {
    return <EnhancedAdminPanelIntegrated />;
  }

  // Use TherapistPanel for therapists - professional admin-style interface
  return <TherapistPanel />;
};

export default RoleBasedDashboard; 