import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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
            { value: 'COMPLETED', label: 'Mark Complete', icon: '✅' },
            { value: 'CANCELLED', label: 'Cancel', icon: '❌' },
            { value: 'NO_SHOW', label: 'Mark No Show', icon: '🚫' }
          ]
        },
        'COMPLETED': {
          display: 'Completed',
          options: [
            { value: 'SCHEDULED', label: 'Reschedule', icon: '📅' },
            { value: 'CANCELLED', label: 'Mark Cancelled', icon: '❌' },
            { value: 'NO_SHOW', label: 'Mark No Show', icon: '🚫' }
          ]
        },
        'CANCELLED': {
          display: 'Cancelled',
          options: [
            { value: 'SCHEDULED', label: 'Reschedule', icon: '📅' },
            { value: 'COMPLETED', label: 'Mark Complete', icon: '✅' },
            { value: 'NO_SHOW', label: 'Mark No Show', icon: '🚫' }
          ]
        },
        'NO_SHOW': {
          display: 'No Show',
          options: [
            { value: 'SCHEDULED', label: 'Reschedule', icon: '📅' },
            { value: 'COMPLETED', label: 'Mark Complete', icon: '✅' },
            { value: 'CANCELLED', label: 'Mark Cancelled', icon: '❌' }
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
    console.log('🔍 handleStatusClick called, loading:', loading);
    if (!loading) {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 250; // Approximate dropdown height
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Calculate if dropdown would go below viewport
        let topPosition = rect.bottom + scrollY + 4;
        
        // If dropdown would go below viewport, position it above the button instead
        if (topPosition + dropdownHeight > scrollY + windowHeight) {
          topPosition = rect.top + scrollY - dropdownHeight - 4;
        }
        
        // Ensure minimum spacing from viewport edges
        const minSpacing = 10;
        if (topPosition < scrollY + minSpacing) {
          topPosition = scrollY + minSpacing;
        }
        
        setDropdownPosition({
          top: topPosition,
          left: rect.left + (rect.width / 2)
        });
      }
      console.log('🔍 Setting isOpen to:', !isOpen);
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (newStatus: boolean | string) => {
    console.log('🔍 Option clicked:', { newStatus, currentStatus: statusConfig.currentValue });
    console.log('🔍 onStatusChange callback exists:', !!onStatusChange);
    console.log('🔍 onStatusChange callback type:', typeof onStatusChange);
    
    if (newStatus !== statusConfig.currentValue) {
      console.log('🔍 Calling onStatusChange with:', newStatus);
      try {
        onStatusChange(newStatus);
        console.log('✅ onStatusChange called successfully');
      } catch (error) {
        console.error('❌ Error calling onStatusChange:', error);
      }
    } else {
      console.log('🔍 Status unchanged, not calling onStatusChange');
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
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'NO_SHOW': 'status-no-show',
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive'
    };
    
    return statusClassMap[currentStatus] || 'status-default';
  };

  return (
    <div className={`clickable-status-dropdown ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
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

      {isOpen && createPortal(
        <div 
          className="status-dropdown-menu"
          style={{ 
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            color: '#1e293b',
            maxHeight: '250px',
            overflow: 'hidden'
          }}
        >
          <div className="dropdown-header" style={{ padding: '12px 16px' }}>
            <span className="current-status">Current: {statusConfig.display}</span>
          </div>
          <div className="dropdown-options" style={{ 
            maxHeight: '180px', 
            overflowY: 'auto',
            padding: '0'
          }}>
            <div style={{ fontSize: '10px', color: 'blue', padding: '5px', borderBottom: '1px solid #e2e8f0' }}>
              DEBUG: {statusConfig.options?.length || 0} options available
            </div>
            {statusConfig.options?.map((option, index) => (
              <button
                key={index}
                className={`dropdown-option ${option.value === statusConfig.currentValue ? 'current' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Button clicked for option:', option);
                  console.log('🖱️ Event details:', { 
                    target: e.target, 
                    currentTarget: e.currentTarget,
                    eventType: e.type 
                  });
                  handleOptionClick(option.value);
                }}
                disabled={option.value === statusConfig.currentValue}
                onMouseEnter={(e) => {
                  if (option.value !== statusConfig.currentValue) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== statusConfig.currentValue) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClickableStatusDropdown; 