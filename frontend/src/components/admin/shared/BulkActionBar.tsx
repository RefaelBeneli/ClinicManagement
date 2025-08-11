import React from 'react';
import styles from './BulkActionBar.module.css';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete?: () => void;
  onBulkUpdate?: () => void;
  onBulkExport?: () => void;
  isVisible: boolean;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkUpdate,
  onBulkExport,
  isVisible
}) => {
  if (!isVisible) return null;

  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className={styles.bulkActionBar}>
      <div className={styles.selectionInfo}>
        <label className={styles.selectAllLabel}>
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isPartiallySelected;
            }}
            onChange={onSelectAll}
            className={styles.selectAllCheckbox}
          />
          <span className={styles.selectAllText}>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </span>
        </label>
        <span className={styles.selectedCount}>
          {selectedCount} of {totalCount} selected
        </span>
      </div>

      <div className={styles.bulkActions}>
        {onBulkUpdate && (
          <button
            onClick={onBulkUpdate}
            className={`${styles.bulkActionButton} ${styles.update}`}
            disabled={selectedCount === 0}
          >
            Update Selected
          </button>
        )}
        
        {onBulkExport && (
          <button
            onClick={onBulkExport}
            className={`${styles.bulkActionButton} ${styles.export}`}
            disabled={selectedCount === 0}
          >
            Export Selected
          </button>
        )}
        
        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className={`${styles.bulkActionButton} ${styles.delete}`}
            disabled={selectedCount === 0}
          >
            Delete Selected
          </button>
        )}
        
        <button
          onClick={onClearSelection}
          className={`${styles.bulkActionButton} ${styles.clear}`}
          disabled={selectedCount === 0}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar; 