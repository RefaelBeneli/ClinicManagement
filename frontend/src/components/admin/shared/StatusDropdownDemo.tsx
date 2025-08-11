import React, { useState } from 'react';
import ClickableStatusDropdown from './ClickableStatusDropdown';
import './ClickableStatusDropdown.css';

const StatusDropdownDemo: React.FC = () => {
  const [userStatus, setUserStatus] = useState(true);
  const [clientStatus, setClientStatus] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState('SCHEDULED');
  const [expenseStatus, setExpenseStatus] = useState(true);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ClickableStatusDropdown Demo</h1>
      <p>This demonstrates the clickable status dropdown functionality for all entity types.</p>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>User Status Management</h2>
        <p>Current status: {userStatus ? 'Active' : 'Inactive'}</p>
        <ClickableStatusDropdown
          currentStatus={userStatus}
          onStatusChange={(newStatus) => setUserStatus(newStatus as boolean)}
          entityId={1}
          entityType="user"
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Client Status Management</h2>
        <p>Current status: {clientStatus ? 'Active' : 'Inactive'}</p>
        <ClickableStatusDropdown
          currentStatus={clientStatus}
          onStatusChange={(newStatus) => setClientStatus(newStatus as boolean)}
          entityId={2}
          entityType="client"
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Meeting Status Management</h2>
        <p>Current status: {meetingStatus}</p>
        <ClickableStatusDropdown
          currentStatus={meetingStatus}
          onStatusChange={(newStatus) => setMeetingStatus(newStatus as string)}
          entityId={3}
          entityType="meeting"
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Expense Status Management</h2>
        <p>Current status: {expenseStatus ? 'Active' : 'Inactive'}</p>
        <ClickableStatusDropdown
          currentStatus={expenseStatus}
          onStatusChange={(newStatus) => setExpenseStatus(newStatus as boolean)}
          entityId={4}
          entityType="expense"
        />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ Clickable status badges that show current status</li>
          <li>✅ Dropdown menus with relevant status options</li>
          <li>✅ Different status types for different entities</li>
          <li>✅ Smooth animations and hover effects</li>
          <li>✅ Responsive design for mobile devices</li>
          <li>✅ Loading states and disabled states</li>
          <li>✅ Click outside to close functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default StatusDropdownDemo; 