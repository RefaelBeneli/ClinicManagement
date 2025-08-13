import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import { adminApi } from '../../../services/adminApi';
import { useApiCall } from '../../../hooks/useApiCall';
import './UsersTab.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UsersTab: React.FC = () => {
  const { makeApiCall } = useApiCall();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  // Prevent duplicate API calls in React StrictMode
  const hasFetchedRef = useRef(false);


  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm]);

  // Update filteredUsers when users change
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await makeApiCall(
        '/api/admin/users',
        () => adminApi.getUsers(),
        { cacheKey: 'admin-users' }
      );
      
      if (!response) {
        console.log('🔄 Skipping duplicate users fetch');
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 Raw users response:', response.data);
      
      // Handle Spring Data Page response
      const usersData = response.data.content || response.data || [];
      console.log('🔍 Extracted users data:', usersData);
      
      // Transform the data to match our interface
      const transformedUsers: User[] = usersData.map((user: any) => ({
        id: user.id,
        name: user.fullName || user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'USER',
        status: user.enabled ? 'ACTIVE' : 'INACTIVE'
      }));
      
      console.log('🔍 Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.createUser(userData);
      
      // Mock creation
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1
      };
      setUsers(prev => [...prev, newUser]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateUser(editingUser.id, userData);
      
      // Mock update
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? { ...user, ...userData } : user
      ));
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        // TODO: Replace with actual API call
        // await adminApi.deleteUser(user.id);
        
        // Mock deletion
        setUsers(prev => prev.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUserStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateUserStatus(entityId, newStatus);
      
      // Mock status update
      setUsers(prev => prev.map(u => 
        u.id === entityId ? { ...u, status: newStatus as string } : u
      ));
      
      console.log('User status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
          setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
          setSelectedUserIds([]);
        }
        break;
      case 'Update Status':
        setUsers(prev => prev.map(u => 
          selectedIds.includes(u.id) 
            ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
            : u
        ));
        setSelectedUserIds([]);
        break;
      case 'Export':
        alert(`Exporting ${selectedIds.length} users...`);
        break;
      default:
        alert(`Bulk action '${action}' not implemented yet.`);
    }
  };

  const filterDefinitions = [
    { key: 'role', label: 'Role', type: 'select' as const, options: ['ADMIN', 'USER'] },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['ACTIVE', 'INACTIVE'] },
  ];

  const columns = [
    { key: 'name', label: 'Name', editable: true },
    { key: 'email', label: 'Email', editable: true },
    { 
      key: 'role', 
      label: 'Role', 
      editable: true,
      clickableDropdown: true,
      enumValues: ['ADMIN', 'USER'],
      onDropdownChange: (value: string, row: any) => {
        // Update the role field when dropdown selection changes
        setUsers(prev => prev.map(u => 
          u.id === row.id ? { ...u, role: value } : u
        ));
      }
    },
  ];

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add User
        </button>
      </div>
      
      <FilterPanel
        filters={filterDefinitions}
        onFiltersChange={setActiveFilters}
        onBulkAction={handleBulkAction}
        selectedRows={selectedUserIds}
        totalRows={filteredUsers.length}
        bulkActions={['Delete', 'Update Status', 'Export']}
      />
      
                            <DataTable
          columns={columns}
          data={filteredUsers}
          selectable={true}
          onSelectionChange={setSelectedUserIds}
          statusColumn={{
            enabled: true,
            entityType: 'user',
            statusKey: 'status',
            onStatusChange: handleUserStatusChange
          }}
          onSave={async (user, updatedData) => {
            try {
              // Call backend API to update user
              const response = await fetch(`http://localhost:8085/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
              });
              
              if (!response.ok) {
                throw new Error('Failed to update user');
              }
              
              // Update local state to reflect changes
              const updatedUser = await response.json();
              setUsers(prevUsers => 
                prevUsers.map(u => u.id === user.id ? updatedUser : u)
              );
              
              // Show success message
              alert('User updated successfully!');
            } catch (error) {
              console.error('Error updating user:', error);
              alert('Failed to update user. Please try again.');
              throw error; // Re-throw to keep editing state
            }
          }}
          onDelete={handleDeleteUser}
          onRestore={async (user) => {
            try {
              // Call backend API to restore user
              const response = await fetch(`http://localhost:8085/api/admin/users/${user.id}/restore`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to restore user');
            }
            
            // Update local state
            setUsers(prevUsers => 
              prevUsers.map(u => u.id === user.id ? { ...u, deleted: false } : u)
            );
            
            alert('User restored successfully!');
          } catch (error) {
            console.error('Error restoring user:', error);
            alert('Failed to restore user. Please try again.');
          }
        }}
        isLoading={isLoading}
      />
      
      {showModal && (
        <AddEditModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Add User'}
          fields={[
            { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter full name' },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
            { key: 'role', label: 'Role', type: 'select', options: ['USER', 'ADMIN'], required: true },
            { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'], required: true },
          ]}
          initialData={editingUser || {}}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        />
      )}
    </div>
  );
};

export default UsersTab; 