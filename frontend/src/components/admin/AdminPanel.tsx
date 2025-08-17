import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardTab from './tabs/DashboardTab';
import UsersTab from './tabs/UsersTab';
import ClientsTab from './tabs/ClientsTab';
import SessionsTab from './tabs/SessionsTab';
import PersonalSessionsTab from './tabs/PersonalSessionsTab';
import ExpensesTab from './tabs/ExpensesTab';
import SystemSettingsTab from './tabs/SystemSettingsTab';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'clients', label: 'Clients', icon: '👤' },
    { id: 'sessions', label: 'Sessions', icon: '📅' },
    { id: 'personal-sessions', label: 'Personal Sessions', icon: '👨‍⚕️' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'system-settings', label: 'System Settings', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UsersTab />;
      case 'clients':
        return <ClientsTab />;
      case 'sessions':
        return <SessionsTab />;
      case 'personal-sessions':
        return <PersonalSessionsTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'system-settings':
        return <SystemSettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Clinic Management System - Admin Panel</h1>
        <div className="admin-user-info">
          <span>Welcome, {user?.fullName || user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel; 