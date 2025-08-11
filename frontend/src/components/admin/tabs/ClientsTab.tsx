import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import './ClientsTab.css';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  therapistName: string;
}

const ClientsTab: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await adminApi.getClients();
      // setClients(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setClients([
          { id: 1, name: 'Alice Johnson', phone: '+1-555-0101', email: 'alice@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
          { id: 2, name: 'Bob Smith', phone: '+1-555-0102', email: 'bob@email.com', status: 'ACTIVE', therapistName: 'Dr. Michael Chen' },
          { id: 3, name: 'Carol Davis', phone: '+1-555-0103', email: 'carol@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
          { id: 4, name: 'David Wilson', phone: '+1-555-0104', email: 'david@email.com', status: 'ACTIVE', therapistName: 'Dr. Emily Rodriguez' },
          { id: 5, name: 'Eva Brown', phone: '+1-555-0105', email: 'eva@email.com', status: 'ACTIVE', therapistName: 'Dr. Michael Chen' },
          { id: 6, name: 'Frank Miller', phone: '+1-555-0106', email: 'frank@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
          { id: 7, name: 'Grace Taylor', phone: '+1-555-0107', email: 'grace@email.com', status: 'ACTIVE', therapistName: 'Dr. Emily Rodriguez' },
          { id: 8, name: 'Henry Anderson', phone: '+1-555-0108', email: 'henry@email.com', status: 'ACTIVE', therapistName: 'Dr. Michael Chen' },
          { id: 9, name: 'Iris Garcia', phone: '+1-555-0109', email: 'iris@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
          { id: 10, name: 'Jack Lee', phone: '+1-555-0110', email: 'jack@email.com', status: 'ACTIVE', therapistName: 'Dr. Emily Rodriguez' },
          { id: 11, name: 'Kate White', phone: '+1-555-0111', email: 'kate@email.com', status: 'ACTIVE', therapistName: 'Dr. Michael Chen' },
          { id: 12, name: 'Liam Black', phone: '+1-555-0112', email: 'liam@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
          { id: 13, name: 'Mia Green', phone: '+1-555-0113', email: 'mia@email.com', status: 'ACTIVE', therapistName: 'Dr. Emily Rodriguez' },
          { id: 14, name: 'Noah Blue', phone: '+1-555-0114', email: 'noah@email.com', status: 'ACTIVE', therapistName: 'Dr. Michael Chen' },
          { id: 15, name: 'Olivia Red', phone: '+1-555-0115', email: 'olivia@email.com', status: 'ACTIVE', therapistName: 'Dr. Sarah Wilson' },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }
    
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.therapistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.createClient(clientData);
      
      // Mock creation
      const newClient = {
        ...clientData,
        id: Math.max(...clients.map(c => c.id)) + 1
      };
      setClients(prev => [...prev, newClient]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleUpdateClient = async (clientData: any) => {
    if (!editingClient) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateClient(editingClient.id, clientData);
      
      // Mock update
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? { ...client, ...clientData } : client
      ));
      setShowModal(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete client ${client.name}?`)) {
      try {
        // TODO: Replace with actual API call
        // await adminApi.deleteClient(client.id);
        
        // Mock deletion
        setClients(prev => prev.filter(c => c.id !== client.id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleClientStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateClientStatus(entityId, newStatus);
      
      // Mock status update
      setClients(prev => prev.map(c => 
        c.id === entityId ? { ...c, status: newStatus as string } : c
      ));
      
      console.log('Client status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    try {
      switch (action) {
        case 'Delete':
          if (window.confirm(`Are you sure you want to delete ${selectedIds.length} clients?`)) {
            setClients(prev => prev.filter(c => !selectedIds.includes(c.id)));
            setSelectedClientIds([]);
            alert(`${selectedIds.length} clients deleted successfully!`);
          }
          break;
        case 'Update Status':
          const newStatus = prompt('Enter new status (ACTIVE/INACTIVE):', 'ACTIVE');
          if (newStatus && ['ACTIVE', 'INACTIVE'].includes(newStatus.toUpperCase())) {
            setClients(prev => prev.map(c => 
              selectedIds.includes(c.id) ? { ...c, status: newStatus.toUpperCase() } : c
            ));
            setSelectedClientIds([]);
            alert(`Status updated for ${selectedIds.length} clients!`);
          }
          break;
        case 'Export':
          const exportData = clients.filter(c => selectedIds.includes(c.id));
          console.log('Exporting clients:', exportData);
          alert(`Exporting ${selectedIds.length} clients...`);
          setSelectedClientIds([]);
          break;
        default:
          alert(`Bulk action '${action}' not implemented yet.`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action. Please try again.');
    }
  };

  const filterDefinitions = [
    { key: 'status', label: 'Status', type: 'select' as const, options: ['ACTIVE', 'INACTIVE'] },
    { key: 'therapistName', label: 'Therapist', type: 'select' as const, options: ['Dr. Sarah Wilson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez'] },
  ];

  const columns = [
    { key: 'name', label: 'Name', editable: true },
    { key: 'phone', label: 'Phone', editable: true },
    { key: 'email', label: 'Email', editable: true },
    { 
      key: 'therapistName', 
      label: 'Therapist', 
      editable: true,
      clickableDropdown: true,
      searchableOptions: [
        { value: 'Dr. Sarah Wilson', label: 'Dr. Sarah Wilson' },
        { value: 'Dr. Michael Chen', label: 'Dr. Michael Chen' },
        { value: 'Dr. Emily Rodriguez', label: 'Dr. Emily Rodriguez' },
      ],
      onDropdownChange: (value: string, row: any) => {
        // Update the therapist field when dropdown selection changes
        setClients(prev => prev.map(c => 
          c.id === row.id ? { ...c, therapistName: value } : c
        ));
      }
    },
  ];

  return (
    <div className="clients-tab">
      <div className="tab-header">
        <h2>Client Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add Client
        </button>
      </div>
      
      <SearchFilter
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search clients..."
      />
      
      <FilterPanel
        filters={filterDefinitions}
        onFiltersChange={setActiveFilters}
        onBulkAction={handleBulkAction}
        selectedRows={selectedClientIds}
        totalRows={filteredClients.length}
        bulkActions={['Delete', 'Update Status', 'Export']}
      />
      
      <DataTable
          columns={columns}
          data={filteredClients}
          selectable={true}
          onSelectionChange={setSelectedClientIds}
          statusColumn={{
            enabled: true,
            entityType: 'client',
            statusKey: 'status',
            onStatusChange: handleClientStatusChange
          }}
          onSave={async (client, updatedData) => {
            try {
              // Transform frontend data to backend format
              const backendData = {
                fullName: updatedData.name || client.name,
                email: updatedData.email || client.email,
                phone: updatedData.phone || client.phone,
                isActive: (updatedData.status || client.status) === 'ACTIVE',
                userId: 1, // TODO: Get actual user ID from context
                sourceId: 1, // TODO: Get actual source ID from context
                notes: null
              };

              console.log('Sending to backend:', backendData);

              // Call backend API to update client
              const response = await fetch(`http://localhost:8085/api/admin/clients/${client.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(backendData)
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                throw new Error(`Backend error: ${errorData.error || 'Unknown error'}`);
              }
              
              // Update local state to reflect changes
              const updatedClient = await response.json();
              setClients(prevClients => 
                prevClients.map(c => c.id === client.id ? { ...c, ...updatedData } : c)
              );
              
              // Show success message
              alert('Client updated successfully!');
            } catch (error) {
              console.error('Error updating client:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              alert(`Failed to update client: ${errorMessage}`);
              throw error; // Re-throw to keep editing state
            }
          }}
          onDelete={handleDeleteClient}
          onRestore={async (client) => {
            // Restore functionality not implemented in backend yet
            alert('Restore functionality is not yet implemented in the backend.');
          }}
          isLoading={isLoading}
        />
      
      {showModal && (
        <AddEditModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
          title={editingClient ? 'Edit Client' : 'Add Client'}
          fields={[
            { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter full name' },
            { key: 'phone', label: 'Phone', type: 'text', required: true, placeholder: 'Enter phone number' },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
            { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'], required: true },
          ]}
          initialData={editingClient || {}}
          onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
        />
      )}
    </div>
  );
};

export default ClientsTab; 