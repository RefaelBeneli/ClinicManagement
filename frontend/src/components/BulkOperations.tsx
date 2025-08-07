import React, { useState, useEffect, useCallback } from 'react';
import './BulkOperations.css';

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  confirmationMessage?: string;
  requiresConfirmation?: boolean;
  isDestructive?: boolean;
  isDisabled?: (selectedIds: string[]) => boolean;
}

export interface BulkOperationProgress {
  id: string;
  total: number;
  completed: number;
  failed: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  errors?: string[];
}

interface BulkOperationsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  onActionExecute: (actionId: string, selectedIds: string[]) => Promise<void>;
  progress?: BulkOperationProgress;
  onProgressCancel?: () => void;
  isVisible?: boolean;
  maxDisplayItems?: number;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  actions,
  onActionExecute,
  progress,
  onProgressCancel,
  isVisible = true,
  maxDisplayItems = 5
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');

  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalItems;

  // Reset confirmation when selection changes
  useEffect(() => {
    if (selectedCount === 0) {
      setShowConfirmation(false);
      setPendingAction(null);
      setConfirmationInput('');
    }
  }, [selectedCount]);

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (isAllSelected || isPartiallySelected) {
      onSelectAll(false);
    } else {
      onSelectAll(true);
    }
  };

  // Handle action click
  const handleActionClick = (action: BulkAction) => {
    if (action.isDisabled && action.isDisabled(selectedItems)) {
      return;
    }

    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmation(true);
      setConfirmationInput('');
    } else {
      executeAction(action);
    }
  };

  // Execute bulk action
  const executeAction = async (action: BulkAction) => {
    try {
      await onActionExecute(action.id, selectedItems);
    } catch (error) {
      console.error(`Failed to execute bulk action ${action.id}:`, error);
    }
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (pendingAction) {
      // For destructive actions, require typing "CONFIRM"
      if (pendingAction.isDestructive && confirmationInput !== 'CONFIRM') {
        return;
      }
      
      executeAction(pendingAction);
      setShowConfirmation(false);
      setPendingAction(null);
      setConfirmationInput('');
    }
  };

  // Handle confirmation cancel
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingAction(null);
    setConfirmationInput('');
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round(((progress.completed + progress.failed) / progress.total) * 100);
  };

  // Get progress status color
  const getProgressStatusColor = () => {
    if (!progress) return '#667eea';
    switch (progress.status) {
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#667eea';
    }
  };

  // Format selected items display
  const getSelectedItemsDisplay = () => {
    if (selectedCount === 0) return 'No items selected';
    if (selectedCount === 1) return '1 item selected';
    if (selectedCount <= maxDisplayItems) {
      return `${selectedCount} items selected`;
    }
    return `${selectedCount} items selected`;
  };

  if (!isVisible || (selectedCount === 0 && !progress)) {
    return null;
  }

  return (
    <>
      <div className={`bulk-operations ${selectedCount > 0 ? 'visible' : 'hidden'}`}>
        <div className="bulk-operations-content">
          {/* Selection Info */}
          <div className="selection-info">
            <div className="selection-checkbox">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAllToggle}
                aria-label={isAllSelected ? 'Deselect all items' : 'Select all items'}
              />
            </div>
            <div className="selection-text">
              <span className="selected-count">{getSelectedItemsDisplay()}</span>
              {totalItems > 0 && (
                <span className="total-count">of {totalItems} total</span>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="bulk-actions">
              {actions.map(action => {
                const isDisabled = action.isDisabled ? action.isDisabled(selectedItems) : false;
                
                return (
                  <button
                    key={action.id}
                    className={`bulk-action-btn ${action.isDestructive ? 'destructive' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleActionClick(action)}
                    disabled={isDisabled}
                    style={{ 
                      borderColor: action.color,
                      color: isDisabled ? undefined : action.color 
                    }}
                    title={isDisabled ? 'This action is not available for the selected items' : action.label}
                  >
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Clear Selection */}
          {selectedCount > 0 && (
            <button
              className="clear-selection-btn"
              onClick={onClearSelection}
              title="Clear selection"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="bulk-progress">
            <div className="progress-info">
              <span className="progress-text">
                {progress.message || `Processing ${progress.completed + progress.failed} of ${progress.total} items`}
              </span>
              <span className="progress-percentage">
                {getProgressPercentage()}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getProgressStatusColor()
                }}
              />
            </div>
            <div className="progress-details">
              <span className="progress-completed">
                ✅ {progress.completed} completed
              </span>
              {progress.failed > 0 && (
                <span className="progress-failed">
                  ❌ {progress.failed} failed
                </span>
              )}
              {progress.status === 'running' && onProgressCancel && (
                <button
                  className="progress-cancel"
                  onClick={onProgressCancel}
                  title="Cancel operation"
                >
                  Cancel
                </button>
              )}
            </div>
            {progress.errors && progress.errors.length > 0 && (
              <div className="progress-errors">
                <details>
                  <summary>View errors ({progress.errors.length})</summary>
                  <ul>
                    {progress.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && pendingAction && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button
                className="modal-close"
                onClick={handleCancelConfirmation}
                aria-label="Cancel action"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="confirmation-icon">
                {pendingAction.isDestructive ? '⚠️' : 'ℹ️'}
              </div>
              
              <div className="confirmation-message">
                <p>
                  {pendingAction.confirmationMessage || 
                   `Are you sure you want to ${pendingAction.label.toLowerCase()} ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`
                  }
                </p>
                
                {pendingAction.isDestructive && (
                  <div className="destructive-warning">
                    <p><strong>This action cannot be undone.</strong></p>
                    <p>Type <strong>CONFIRM</strong> to proceed:</p>
                    <input
                      type="text"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value.toUpperCase())}
                      placeholder="Type CONFIRM"
                      className="confirmation-input"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              <div className="selected-items-summary">
                <p>Selected items: {selectedCount}</p>
                {selectedCount <= 10 && (
                  <ul className="selected-items-list">
                    {selectedItems.slice(0, 10).map((id, index) => (
                      <li key={id}>Item {index + 1} (ID: {id})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={handleCancelConfirmation}
              >
                Cancel
              </button>
              <button
                className={`btn-confirm ${pendingAction.isDestructive ? 'destructive' : ''}`}
                onClick={handleConfirmAction}
                disabled={pendingAction.isDestructive && confirmationInput !== 'CONFIRM'}
              >
                <span className="action-icon">{pendingAction.icon}</span>
                {pendingAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperations; 