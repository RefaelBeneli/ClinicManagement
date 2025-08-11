import React, { useState, useRef, useEffect } from 'react';
import './ClickableStatusDropdown.css';

interface ClickableStatusDropdownProps {
  currentStatus: boolean | string;
  onStatusChange: (newStatus: boolean | string) => void;
  entityId: number | string;
  entityType: 'user' | 'client' | 'meeting' | 'expense' | 'source' | 'type';
  loading?: boolean;
  className?: string;
}

const ClickableStatusDropdown: React.FC<ClickableStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  entityId,
  entityType,
  loading = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine status display and options based on entity type
  const getStatusConfig = () => {
    if (typeof currentStatus === 'boolean') {
      return {
        display: currentStatus ? 'Active' : 'Inactive',
        options: [
          { value: true, label: 'Activate', icon: '✅' },
          { value: false, label: 'Deactivate', icon: '❌' }
        ],
        currentValue: currentStatus
      };
    } else {
      // Handle string-based statuses
      const statusMap: Record<string, { display: string; options: Array<{ value: string; label: string; icon: string }> }> = {
        'PENDING': {
          display: 'Pending',
          options: [
            { value: 'APPROVED', label: 'Approve', icon: '✅' },
            { value: 'REJECTED', label: 'Reject', icon: '❌' }
          ]
        },
        'APPROVED': {
          display: 'Approved',
          options: [
            { value: 'REJECTED', label: 'Reject', icon: '❌' },
            { value: 'PENDING', label: 'Set Pending', icon: '⏳' }
          ]
        },
        'REJECTED': {
          display: 'Rejected',
          options: [
            { value: 'APPROVED', label: 'Approve', icon: '✅' },
            { value: 'PENDING', label: 'Set Pending', icon: '⏳' }
          ]
        },
        'SCHEDULED': {
          display: 'Scheduled',
          options: [
            { value: 'IN_PROGRESS', label: 'Start', icon: '▶️' },
            { value: 'CANCELLED', label: 'Cancel', icon: '❌' }
          ]
        },
        'IN_PROGRESS': {
          display: 'In Progress',
          options: [
            { value: 'COMPLETED', label: 'Complete', icon: '✅' },
            { value: 'CANCELLED', label: 'Cancel', icon: '❌' }
          ]
        },
        'COMPLETED': {
          display: 'Completed',
          options: [
            { value: 'IN_PROGRESS', label: 'Reopen', icon: '🔄' },
            { value: 'CANCELLED', label: 'Mark Cancelled', icon: '❌' }
          ]
        },
        'CANCELLED': {
          display: 'Cancelled',
          options: [
            { value: 'SCHEDULED', label: 'Reschedule', icon: '📅' },
            { value: 'COMPLETED', label: 'Mark Complete', icon: '✅' }
          ]
        }
      };

      const config = statusMap[currentStatus] || {
        display: currentStatus,
        options: [
          { value: 'ACTIVE', label: 'Activate', icon: '✅' },
          { value: 'INACTIVE', label: 'Deactivate', icon: '❌' }
        ]
      };

      return {
        ...config,
        currentValue: currentStatus
      };
    }
  };

  const statusConfig = getStatusConfig();

  const handleStatusClick = () => {
    if (!loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (newStatus: boolean | string) => {
    if (newStatus !== statusConfig.currentValue) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  const getStatusBadgeClass = () => {
    if (typeof currentStatus === 'boolean') {
      return currentStatus ? 'status-active' : 'status-inactive';
    }
    
    // For string-based statuses
    const statusClassMap: Record<string, string> = {
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'SCHEDULED': 'status-scheduled',
      'IN_PROGRESS': 'status-in-progress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive'
    };
    
    return statusClassMap[currentStatus] || 'status-default';
  };

  return (
    <div className={`clickable-status-dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`status-badge ${getStatusBadgeClass()} ${isOpen ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onClick={handleStatusClick}
        disabled={loading}
        title={`Click to change status (currently: ${statusConfig.display})`}
      >
        {loading ? (
          <span className="loading-spinner">🔄</span>
        ) : (
          <>
            <span className="status-text">{statusConfig.display}</span>
            <span className="dropdown-arrow">▼</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="status-dropdown-menu">
          <div className="dropdown-header">
            <span className="current-status">Current: {statusConfig.display}</span>
          </div>
          <div className="dropdown-options">
            {statusConfig.options.map((option, index) => (
              <button
                key={index}
                className={`dropdown-option ${option.value === statusConfig.currentValue ? 'current' : ''}`}
                onClick={() => handleOptionClick(option.value)}
                disabled={option.value === statusConfig.currentValue}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClickableStatusDropdown; 