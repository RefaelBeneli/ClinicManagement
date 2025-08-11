import React from 'react';
import { QuickActionConfig } from '../types';
import Modal from '../../ui/Modal';
import styles from './QuickActionModal.module.css';

interface QuickActionModalProps extends QuickActionConfig {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  action,
  entityType,
  data,
  onClose,
  onSubmit
}) => {
  const getModalTitle = () => {
    const actionMap = {
      create: 'Add',
      edit: 'Edit',
      view: 'View',
      delete: 'Delete',
      bulk: 'Bulk Action'
    };
    
    const entityMap = {
      user: 'User',
      client: 'Client',
      session: 'Session',
      expense: 'Expense',
      type: 'Type'
    };
    
    return `${actionMap[action]} ${entityMap[entityType]}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just close the modal
    // In a real implementation, this would handle form data
    console.log('Modal submit:', { action, entityType, data });
    onSubmit({ action, entityType, data });
  };

  const renderFormContent = () => {
    // This is a placeholder implementation
    // In the real system, this would render different forms based on entity type
    return (
      <div className={styles.modalContent}>
        <div className={styles.placeholderContent}>
          <div className={styles.iconContainer}>
            <span className={styles.actionIcon}>
              {action === 'create' ? '➕' : 
               action === 'edit' ? '✏️' : 
               action === 'view' ? '👁️' : 
               action === 'delete' ? '🗑️' : '⚡'}
            </span>
          </div>
          
          <h3 className={styles.placeholderTitle}>
            {getModalTitle()}
          </h3>
          
          <p className={styles.placeholderDescription}>
            {action === 'create' && `Create a new ${entityType} in the system.`}
            {action === 'edit' && `Modify the selected ${entityType}.`}
            {action === 'view' && `View details for the selected ${entityType}.`}
            {action === 'delete' && `Remove the selected ${entityType} from the system.`}
            {action === 'bulk' && `Perform bulk operations on multiple ${entityType}s.`}
          </p>
          
          <div className={styles.formPlaceholder}>
            <p>Form fields for {entityType} management will be implemented here.</p>
            <p>This modal will integrate with existing form components from the current admin panels.</p>
          </div>
        </div>
        
        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className={styles.submitButton}
          >
            {action === 'create' ? 'Create' : 
             action === 'edit' ? 'Save' : 
             action === 'delete' ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    );
  };

  // If Modal component doesn't exist, render a simple modal
  if (!Modal) {
    return isOpen ? (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            {renderFormContent()}
          </form>
        </div>
      </div>
    ) : null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.quickActionModal}>
        {renderFormContent()}
      </form>
    </Modal>
  );
};

export default QuickActionModal; 