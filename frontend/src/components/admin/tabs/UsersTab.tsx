import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);
  const rootUrl = useMemo(() => apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl, [apiUrl]);


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

  const fetchUsers = async (page: number = currentPage, size: number = pageSize) => {
    setIsLoading(true);
    try {
      const response = await makeApiCall(
        `${rootUrl}/admin/users`,
        () => adminApi.getUsers(page, size),
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
      
      // Extract pagination info
      if (response.data.totalElements !== undefined) {
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
      
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
      // Call backend API to update user
      const response = await fetch(`${rootUrl}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      
      // Get updated user data from response
      const updatedUser = await response.json();
      
      // Update local state with the response data
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? {
          ...user,
          name: updatedUser.fullName || user.name,
          email: updatedUser.email || user.email,
          role: updatedUser.role || user.role,
          status: updatedUser.enabled ? 'ACTIVE' : 'INACTIVE'
        } : user
      ));
      
      setShowModal(false);
      setEditingUser(null);
      
      // Show success message
      alert('User updated successfully!');
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        // Call backend API to delete user
        const response = await fetch(`${rootUrl}/admin/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.statusText}`);
        }
        
        // Remove user from local state after successful deletion
        setUsers(prev => prev.filter(u => u.id !== user.id));
        
        // Show success message
        alert('User deleted successfully!');
        
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1; // Convert from 1-based UI to 0-based backend
    setCurrentPage(zeroBasedPage);
    fetchUsers(zeroBasedPage, pageSize);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
    fetchUsers(0, size);
  };

  const handleUserStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // Convert frontend status to backend enabled field
      const enabled = newStatus === 'ACTIVE' || newStatus === true;
      
      // Call backend API to update user status
      const response = await fetch(`${rootUrl}/admin/users/${entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enabled })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.statusText}`);
      }
      
      // Update local state after successful backend update
      setUsers(prev => prev.map(u => 
        u.id === entityId ? { ...u, status: newStatus as string } : u
      ));
      
      console.log('User status updated successfully:', entityId, newStatus);
      
      // Show success message
      alert(`User status updated to ${newStatus === 'ACTIVE' ? 'Active' : 'Inactive'}`);
      
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
          try {
            // Delete all selected users via API
            const deletePromises = selectedIds.map(async (userId) => {
              const response = await fetch(`${rootUrl}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (!response.ok) {
                throw new Error(`Failed to delete user ${userId}: ${response.statusText}`);
              }
              
              return { userId, success: true };
            });
            
            // Wait for all deletions to complete
            const results = await Promise.allSettled(deletePromises);
            
            // Count successes and failures
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.length - successful;
            
            // Remove successfully deleted users from local state
            setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
            setSelectedUserIds([]);
            
            // Show results
            if (failed === 0) {
              alert(`Successfully deleted ${successful} users`);
            } else {
              alert(`Deleted ${successful} users successfully. ${failed} deletions failed.`);
            }
            
          } catch (error) {
            console.error('Error in bulk delete:', error);
            alert(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        break;
      case 'Update Status':
        try {
          // Get current status of first selected user to determine new status
          const firstUser = users.find(u => selectedIds.includes(u.id));
          if (!firstUser) break;
          
          const newStatus = firstUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          const enabled = newStatus === 'ACTIVE';
          
          // Update all selected users via API
          const updatePromises = selectedIds.map(async (userId) => {
            const response = await fetch(`${rootUrl}/admin/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ enabled })
            });
            
            if (!response.ok) {
              throw new Error(`Failed to update user ${userId}: ${response.statusText}`);
            }
            
            return { userId, success: true };
          });
          
          // Wait for all updates to complete
          const results = await Promise.allSettled(updatePromises);
          
          // Count successes and failures
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.length - successful;
          
          // Update local state for successful updates
          setUsers(prev => prev.map(u => 
            selectedIds.includes(u.id) ? { ...u, status: newStatus } : u
          ));
          
          setSelectedUserIds([]);
          
          // Show results
          if (failed === 0) {
            alert(`Successfully updated ${successful} users to ${newStatus === 'ACTIVE' ? 'Active' : 'Inactive'}`);
          } else {
            alert(`Updated ${successful} users successfully. ${failed} updates failed.`);
          }
          
        } catch (error) {
          console.error('Error in bulk status update:', error);
          alert(`Bulk status update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
    { key: 'name', label: 'Name', editable: true, sortable: true },
    { key: 'email', label: 'Email', editable: true, sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      editable: true,
      sortable: true,
      clickableDropdown: true,
      enumValues: ['ADMIN', 'USER'],
      onDropdownChange: (value: string, row: any) => {
        // Update the role field when dropdown selection changes
        setUsers(prev => prev.map(u => 
          u.id === row.id ? { ...u, role: value } : u
        ));
      }
    },
    { key: 'status', label: 'Status', editable: true, sortable: true, enumValues: ['ACTIVE', 'INACTIVE'] }
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
            entityType: 'user',
            statusKey: 'status',
            onStatusChange: handleUserStatusChange
          }}
          onSave={async (user, updatedData) => {
            try {
              // Call backend API to update user
              const response = await fetch(`${rootUrl}/admin/users/${user.id}`, {
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
              
              // Get updated user data from response
              const updatedUser = await response.json();
              
              // Update local state to reflect changes - transform backend data to frontend format
              setUsers(prevUsers => 
                prevUsers.map(u => u.id === user.id ? {
                  ...u,
                  name: updatedUser.fullName || u.name,
                  email: updatedUser.email || u.email,
                  role: updatedUser.role || u.role,
                  status: updatedUser.enabled ? 'ACTIVE' : 'INACTIVE'
                } : u)
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
              const response = await fetch(`${rootUrl}/admin/users/${user.id}/restore`, {
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