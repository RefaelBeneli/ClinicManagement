import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import { adminApi } from '../../../services/adminApi';
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
  
  // Prevent duplicate API calls in React StrictMode
  const hasFetchedRef = useRef(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchClients();
    }
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm]);

  const fetchClients = async (page: number = currentPage, size: number = pageSize) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getClients(page, size);
      
      // Handle Spring Data Page response
      const clientsData = response.data.content || response.data || [];
      
      // Extract pagination info
      if (response.data.totalElements !== undefined) {
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
      
      // Transform the data to match our interface
      const transformedClients: Client[] = clientsData.map((client: any) => ({
        id: client.id,
        name: client.fullName || client.name || 'Unknown',
        phone: client.phone || '',
        email: client.email || '',
        status: client.isActive ? 'ACTIVE' : 'INACTIVE',
        therapistName: client.userFullName || client.therapistName || 'Unassigned'
      }));
      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
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

  // Update filtered clients when clients change
  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const handleCreateClient = async (clientData: any) => {
    try {
      await adminApi.createClient(clientData);
      // Refresh the clients list
      fetchClients();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleUpdateClient = async (clientData: any) => {
    if (!editingClient) return;
    
    try {
      await adminApi.updateClient(editingClient.id, clientData);
      // Refresh the clients list
      fetchClients();
      setShowModal(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete client ${client.name}?`)) {
      try {
        await adminApi.deleteClient(client.id);
        // Refresh the clients list
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1; // Convert from 1-based UI to 0-based backend
    setCurrentPage(zeroBasedPage);
    fetchClients(zeroBasedPage, pageSize);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
    fetchClients(0, size);
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
    { key: 'name', label: 'Name', editable: true, sortable: true },
    { key: 'phone', label: 'Phone', editable: true, sortable: true },
    { key: 'email', label: 'Email', editable: true, sortable: true },
    { 
      key: 'therapistName', 
      label: 'Therapist', 
      editable: true,
      sortable: true,
      validatedInput: true,
      onValidatedChange: (value: string, row: any) => {
        // Update the therapist field when input changes
        setClients(prev => prev.map(c => 
          c.id === row.id ? { ...c, therapistName: value } : c
        ));
      }
    }
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
          pagination={{
            enabled: true,
            currentPage: currentPage + 1, // Convert from 0-based to 1-based for display
            pageSize: pageSize,
            totalElements: totalElements,
            totalPages: totalPages,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange
          }}
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