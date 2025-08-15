import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import { adminApi } from '../../../services/adminApi';
import './PersonalSessionsTab.css';

interface PersonalSession {
  id: number;
  user: string;
  provider: string;
  date: string;
  time: string;
  type: string;
  status: string;
  isActive: boolean; // Added for activity status (soft delete)
}

const PersonalSessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<PersonalSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<PersonalSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<PersonalSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
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
      fetchSessions();
    }
  }, []);

  useEffect(() => {
    filterSessions();
  }, [searchTerm]);

  // Update filteredSessions when sessions change
  useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

  const fetchSessions = async (page: number = currentPage, size: number = pageSize) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPersonalSessions(page, size);
      console.log('🔍 Raw personal sessions response:', response.data);
      
      // Handle Spring Data Page response
      const sessionsData = response.data.content || response.data || [];
      console.log('🔍 Extracted personal sessions data:', sessionsData);
      
      // Extract pagination info
      if (response.data.totalElements !== undefined) {
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
      
      // Transform the data to match our interface
      const transformedSessions: PersonalSession[] = sessionsData.map((session: any) => ({
        id: session.id,
        user: session.userFullName || session.user || 'Unknown',
        provider: session.therapistName || session.providerName || session.provider || 'Unknown',
        date: session.meetingDate ? new Date(session.meetingDate).toLocaleDateString() : 'Unknown',
        time: session.meetingDate ? new Date(session.meetingDate).toLocaleTimeString() : 'Unknown',
        type: session.meetingType || session.type || 'Session',
        status: session.status || 'SCHEDULED',
        isActive: session.isActive !== false
      }));
      
      console.log('🔍 Transformed personal sessions:', transformedSessions);
      setSessions(transformedSessions);
    } catch (error) {
      console.error('Error fetching personal sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    if (!searchTerm) {
      setFilteredSessions(sessions);
      return;
    }
    
    const filtered = sessions.filter(session =>
      session.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSessions(filtered);
  };

  const handleCreateSession = async (sessionData: any) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.createPersonalSession(sessionData);
      
      // Mock creation
      const newSession = {
        ...sessionData,
        id: Math.max(...sessions.map(s => s.id)) + 1
      };
      setSessions(prev => [...prev, newSession]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating personal session:', error);
    }
  };

  const handleUpdateSession = async (sessionData: any) => {
    if (!editingSession) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.updatePersonalSession(editingSession.id, sessionData);
      
      // Mock update
      setSessions(prev => prev.map(session => 
        session.id === editingSession.id ? { ...session, ...sessionData } : session
      ));
      setShowModal(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating personal session:', error);
    }
  };

  const handleDeleteSession = async (session: PersonalSession) => {
    if (window.confirm(`Are you sure you want to delete this personal session?`)) {
      try {
        // TODO: Replace with actual API call
        // await adminApi.deletePersonalSession(session.id);
        
        // Mock deletion
        setSessions(prev => prev.filter(s => s.id !== session.id));
      } catch (error) {
        console.error('Error deleting personal session:', error);
      }
    }
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1; // Convert from 1-based UI to 0-based backend
    setCurrentPage(zeroBasedPage);
    fetchSessions(zeroBasedPage, pageSize);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
    fetchSessions(0, size);
  };

  const handlePersonalSessionStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updatePersonalSessionStatus(entityId, newStatus);
      
      // Mock status update
      setSessions(prev => prev.map(s => 
        s.id === entityId ? { ...s, status: newStatus as string } : s
      ));
      
      console.log('Personal session status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating personal session status:', error);
    }
  };

  const handlePersonalSessionActivityStatusChange = async (entityId: number | string, newStatus: boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updatePersonalSessionActivityStatus(entityId, newStatus);
      
      // Mock activity status update (soft delete/restore)
      setSessions(prev => prev.map(s => 
        s.id === entityId ? { ...s, isActive: newStatus } : s
      ));
      
      console.log('Personal session activity status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating personal session activity status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} personal sessions?`)) {
          setSessions(prev => prev.filter(s => !selectedIds.includes(s.id)));
          setSelectedSessionIds([]);
        }
        break;
      case 'Update Status':
        setSessions(prev => prev.map(s => 
          selectedIds.includes(s.id) 
            ? { ...s, status: 'COMPLETED' }
            : s
        ));
        setSelectedSessionIds([]);
        break;
      case 'Export':
        alert(`Exporting ${selectedIds.length} personal sessions...`);
        break;
      default:
        alert(`Bulk action '${action}' not implemented yet.`);
    }
  };

  const filterDefinitions = [
    { key: 'type', label: 'Type', type: 'select' as const, options: ['Therapy', 'Guidance', 'Assessment'] },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
  ];

  const columns = [
    { 
      key: 'user', 
      label: 'User', 
      editable: true,
      sortable: true,
      validatedInput: true,
      onValidatedChange: (value: string, row: any) => {
        // Update the user field when input changes
        setSessions(prev => prev.map(s => 
          s.id === row.id ? { ...s, user: value } : s
        ));
      }
    },
    { 
      key: 'provider', 
      label: 'Provider', 
      editable: true,
      sortable: true,
      validatedInput: true,
      onValidatedChange: (value: string, row: any) => {
        // Update the provider field when input changes
        setSessions(prev => prev.map(s => 
          s.id === row.id ? { ...s, provider: value } : s
        ));
      }
    },
    { key: 'date', label: 'Date', editable: true, sortable: true },
    { key: 'time', label: 'Time', editable: true, sortable: true },
    { key: 'type', label: 'Type', editable: true, sortable: true, enumValues: ['Therapy', 'Guidance', 'Assessment'] },
  ];

  return (
    <div className="personal-sessions-tab">
      <div className="tab-header">
        <h2>Personal Sessions Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add Personal Session
        </button>
      </div>
      
      <FilterPanel
        filters={filterDefinitions}
        onFiltersChange={setActiveFilters}
        onBulkAction={handleBulkAction}
        selectedRows={selectedSessionIds}
        totalRows={filteredSessions.length}
        bulkActions={['Delete', 'Update Status', 'Export']}
      />
      
              <DataTable
          columns={columns}
          data={filteredSessions}
          selectable={true}
          onSelectionChange={setSelectedSessionIds}
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
            entityType: 'meeting',
            statusKey: 'status',
            onStatusChange: handlePersonalSessionStatusChange
          }}
          activityStatusColumn={{
            enabled: true,
            entityType: 'meeting',
            activityStatusKey: 'isActive',
            onActivityStatusChange: handlePersonalSessionActivityStatusChange
          }}
          onSave={async (session, updatedData) => {
            try {
              // Call backend API to update personal session
              const response = await fetch(`http://localhost:8085/api/admin/personal-sessions/${session.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
              });
              
              if (!response.ok) {
                throw new Error('Failed to update personal session');
              }
              
              // Update local state to reflect changes
              const updatedSession = await response.json();
              setSessions(prevSessions => 
                prevSessions.map(s => s.id === session.id ? updatedSession : s)
              );
              
              // Show success message
              alert('Personal session updated successfully!');
            } catch (error) {
              console.error('Error updating personal session:', error);
              alert('Failed to update personal session. Please try again.');
              throw error; // Re-throw to keep editing state
            }
          }}
          onDelete={handleDeleteSession}
          onRestore={async (session) => {
            try {
              // Call backend API to restore personal session
              const response = await fetch(`http://localhost:8085/api/admin/personal-sessions/${session.id}/restore`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to restore personal session');
              }
              
              // Update local state
              setSessions(prevSessions => 
                prevSessions.map(s => s.id === session.id ? { ...s, deleted: false } : s)
              );
              
              alert('Personal session restored successfully!');
            } catch (error) {
              console.error('Error restoring personal session:', error);
              alert('Failed to restore personal session. Please try again.');
            }
          }}
          isLoading={isLoading}
        />
      
      {showModal && (
        <AddEditModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingSession(null);
          }}
          title={editingSession ? 'Edit Personal Session' : 'Add Personal Session'}
          fields={[
            { key: 'provider', label: 'Provider', type: 'text', required: true, placeholder: 'Enter provider name' },
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'time', label: 'Time', type: 'text', required: true, placeholder: 'Enter time (HH:MM)' },
            { key: 'type', label: 'Type', type: 'select', options: ['Therapy', 'Guidance', 'Assessment'], required: true },
            { key: 'status', label: 'Status', type: 'select', options: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], required: true },
          ]}
          initialData={editingSession || {}}
          onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        />
      )}
    </div>
  );
};

export default PersonalSessionsTab; 