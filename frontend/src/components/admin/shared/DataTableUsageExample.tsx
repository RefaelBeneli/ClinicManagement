import React, { useState } from 'react';
import DataTable from './DataTable';

// Example data structure
interface ExampleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  enabled: boolean; // This is the status field
}

interface ExampleClient {
  id: number;
  name: string;
  email: string;
  active: boolean; // This is the status field
}

const DataTableUsageExample: React.FC = () => {
  const [users, setUsers] = useState<ExampleUser[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'ADMIN', enabled: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', enabled: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', enabled: true },
  ]);

  const [clients, setClients] = useState<ExampleClient[]>([
    { id: 1, name: 'Client A', email: 'clienta@example.com', active: true },
    { id: 2, name: 'Client B', email: 'clientb@example.com', active: false },
    { id: 3, name: 'Client C', email: 'clientc@example.com', active: true },
  ]);

  // Status change handlers
  const handleUserStatusChange = async (entityId: number | string, newStatus: boolean | string) => {
    try {
      // Simulate API call
      console.log('Updating user status:', entityId, newStatus);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === entityId ? { ...user, enabled: newStatus as boolean } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleClientStatusChange = async (entityId: number | string, newStatus: boolean | string) => {
    try {
      // Simulate API call
      console.log('Updating client status:', entityId, newStatus);
      
      // Update local state
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === entityId ? { ...client, active: newStatus as boolean } : client
        )
      );
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  // Column definitions
  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  const clientColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>DataTable with ClickableStatusDropdown Example</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Users Table</h2>
        <p>Click on the status badges to activate/deactivate users</p>
        <DataTable
          columns={userColumns}
          data={users}
          selectable={true}
          statusColumn={{
            enabled: true,
            entityType: 'user',
            statusKey: 'enabled',
            onStatusChange: handleUserStatusChange
          }}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Clients Table</h2>
        <p>Click on the status badges to activate/deactivate clients</p>
        <DataTable
          columns={clientColumns}
          data={clients}
          selectable={true}
          statusColumn={{
            enabled: true,
            entityType: 'client',
            statusKey: 'active',
            onStatusChange: handleClientStatusChange
          }}
        />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>How to Use:</h3>
        <ol>
          <li><strong>Enable Status Column</strong>: Set <code>statusColumn.enabled: true</code></li>
          <li><strong>Specify Entity Type</strong>: Choose from 'user', 'client', 'meeting', 'expense', 'source', 'type'</li>
          <li><strong>Set Status Key</strong>: Specify which field in your data contains the status (e.g., 'enabled', 'active')</li>
          <li><strong>Handle Status Changes</strong>: Provide <code>onStatusChange</code> callback to handle status updates</li>
        </ol>
        
        <h4>Example Configuration:</h4>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
{`statusColumn={{
  enabled: true,
  entityType: 'user',
  statusKey: 'enabled',
  onStatusChange: handleUserStatusChange
}}`}
        </pre>
      </div>
    </div>
  );
};

export default DataTableUsageExample; 