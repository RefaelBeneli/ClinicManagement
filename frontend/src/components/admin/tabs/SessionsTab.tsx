import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import './SessionsTab.css';

interface Session {
  id: number;
  client: string;
  date: string;
  time: string;
  type: string;
  status: string;
  therapistName: string;
  isActive: boolean; // Added for activity status (soft delete)
}

const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await adminApi.getSessions();
      // setSessions(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setSessions([
          { id: 1, client: 'Alice Johnson', date: '2025-01-15', time: '10:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Sarah Wilson', isActive: true },
          { id: 2, client: 'Bob Smith', date: '2025-01-15', time: '14:00', type: 'Consultation', status: 'COMPLETED', therapistName: 'Dr. Michael Chen', isActive: true },
          { id: 3, client: 'Carol Davis', date: '2025-01-16', time: '09:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Sarah Wilson', isActive: true },
          { id: 4, client: 'David Wilson', date: '2025-01-16', time: '11:00', type: 'Assessment', status: 'SCHEDULED', therapistName: 'Dr. Emily Rodriguez', isActive: true },
          { id: 5, client: 'Eva Brown', date: '2025-01-16', time: '15:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Michael Chen', isActive: true },
          { id: 6, client: 'Frank Miller', date: '2025-01-17', time: '09:00', type: 'Consultation', status: 'SCHEDULED', therapistName: 'Dr. Sarah Wilson', isActive: true },
          { id: 7, client: 'Grace Taylor', date: '2025-01-17', time: '13:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Emily Rodriguez', isActive: true },
          { id: 8, client: 'Henry Anderson', date: '2025-01-17', time: '16:00', type: 'Assessment', status: 'SCHEDULED', therapistName: 'Dr. Michael Chen', isActive: true },
          { id: 9, client: 'Iris Garcia', date: '2025-01-18', time: '10:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Sarah Wilson', isActive: true },
          { id: 10, client: 'Jack Lee', date: '2025-01-18', time: '14:00', type: 'Consultation', status: 'SCHEDULED', therapistName: 'Dr. Sarah Wilson', isActive: true },
          { id: 11, client: 'Kate White', date: '2025-01-19', time: '09:00', type: 'Therapy', status: 'SCHEDULED', therapistName: 'Dr. Michael Chen', isActive: true },
          { id: 12, client: 'Liam Black', date: '2025-01-19', time: '11:00', type: 'Assessment', status: 'SCHEDULED', therapistName: 'Dr. Emily Rodriguez', isActive: true },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    if (!searchTerm) {
      setFilteredSessions(sessions);
      return;
    }
    
    const filtered = sessions.filter(session =>
      session.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSessions(filtered);
  };

  const handleCreateSession = async (sessionData: any) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.createSession(sessionData);
      
      // Mock creation
      const newSession = {
        ...sessionData,
        id: Math.max(...sessions.map(s => s.id)) + 1
      };
      setSessions(prev => [...prev, newSession]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleUpdateSession = async (sessionData: any) => {
    if (!editingSession) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateSession(editingSession.id, sessionData);
      
      // Mock update
      setSessions(prev => prev.map(session => 
        session.id === editingSession.id ? { ...session, ...sessionData } : session
      ));
      setShowModal(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async (session: Session) => {
    if (window.confirm(`Are you sure you want to delete this session?`)) {
      try {
        // TODO: Replace with actual API call
        // await adminApi.deleteSession(session.id);
        
        // Mock deletion
        setSessions(prev => prev.filter(s => s.id !== session.id));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleSessionStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateSessionStatus(entityId, newStatus);
      
      // Mock status update
      setSessions(prev => prev.map(s => 
        s.id === entityId ? { ...s, status: newStatus as string } : s
      ));
      
      console.log('Session status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const handleSessionActivityStatusChange = async (entityId: number | string, newStatus: boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateSessionActivityStatus(entityId, newStatus);
      
      // Mock activity status update (soft delete/restore)
      setSessions(prev => prev.map(s => 
        s.id === entityId ? { ...s, isActive: newStatus } : s
      ));
      
      console.log('Session activity status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating session activity status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} sessions?`)) {
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
        alert(`Exporting ${selectedIds.length} sessions...`);
        break;
      default:
        alert(`Bulk action '${action}' not implemented yet.`);
    }
  };

  const filterDefinitions = [
    { key: 'type', label: 'Type', type: 'select' as const, options: ['Therapy', 'Consultation', 'Assessment'] },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
  ];

  const columns = [
    { 
      key: 'client', 
      label: 'Client', 
      editable: true,
      clickableDropdown: true,
      searchableOptions: [
        { value: 'Alice Johnson', label: 'Alice Johnson' },
        { value: 'Bob Smith', label: 'Bob Smith' },
        { value: 'Carol Davis', label: 'Carol Davis' },
        { value: 'David Wilson', label: 'David Wilson' },
        { value: 'Eva Brown', label: 'Eva Brown' },
        { value: 'Frank Miller', label: 'Frank Miller' },
        { value: 'Grace Taylor', label: 'Grace Taylor' },
        { value: 'Henry Anderson', label: 'Henry Anderson' },
        { value: 'Iris Garcia', label: 'Iris Garcia' },
        { value: 'Jack Lee', label: 'Jack Lee' },
        { value: 'Kate White', label: 'Kate White' },
        { value: 'Liam Black', label: 'Liam Black' },
      ],
      onDropdownChange: (value: string, row: any) => {
        // Update the client field when dropdown selection changes
        setSessions(prev => prev.map(s => 
          s.id === row.id ? { ...s, client: value } : s
        ));
      }
    },
    { key: 'date', label: 'Date', editable: true },
    { key: 'time', label: 'Time', editable: true },
    { key: 'type', label: 'Type', editable: true, enumValues: ['Therapy', 'Consultation', 'Assessment'] },
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
        setSessions(prev => prev.map(s => 
          s.id === row.id ? { ...s, therapistName: value } : s
        ));
      }
    },
  ];

  return (
    <div className="sessions-tab">
      <div className="tab-header">
        <h2>Session Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add Session
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
          statusColumn={{
            enabled: true,
            entityType: 'meeting',
            statusKey: 'status',
            onStatusChange: handleSessionStatusChange
          }}
          activityStatusColumn={{
            enabled: true,
            entityType: 'meeting',
            activityStatusKey: 'isActive',
            onActivityStatusChange: handleSessionActivityStatusChange
          }}
          onSave={async (session, updatedData) => {
            try {
              // Call backend API to update session
              const response = await fetch(`http://localhost:8085/api/admin/sessions/${session.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
              });
              
              if (!response.ok) {
                throw new Error('Failed to update session');
              }
              
              // Update local state to reflect changes
              const updatedSession = await response.json();
              setSessions(prevSessions => 
                prevSessions.map(s => s.id === session.id ? updatedSession : s)
              );
              
              // Show success message
              alert('Session updated successfully!');
            } catch (error) {
              console.error('Error updating session:', error);
              alert('Failed to update session. Please try again.');
              throw error; // Re-throw to keep editing state
            }
          }}
          onDelete={handleDeleteSession}
          onRestore={async (session) => {
            try {
              // Call backend API to restore session
              const response = await fetch(`http://localhost:8085/api/admin/sessions/${session.id}/restore`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to restore session');
              }
              
              // Update local state
              setSessions(prevSessions => 
                prevSessions.map(s => s.id === session.id ? { ...s, deleted: false } : s)
              );
              
              alert('Session restored successfully!');
            } catch (error) {
              console.error('Error restoring session:', error);
              alert('Failed to restore session. Please try again.');
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
          title={editingSession ? 'Edit Session' : 'Add Session'}
          fields={[
            { key: 'client', label: 'Client', type: 'text', required: true, placeholder: 'Enter client name' },
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'time', label: 'Time', type: 'text', required: true, placeholder: 'Enter time (HH:MM)' },
            { key: 'type', label: 'Type', type: 'select', options: ['Therapy', 'Consultation', 'Assessment'], required: true },
            { key: 'status', label: 'Status', type: 'select', options: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], required: true },
          ]}
          initialData={editingSession || {}}
          onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        />
      )}
    </div>
  );
};

export default SessionsTab; 