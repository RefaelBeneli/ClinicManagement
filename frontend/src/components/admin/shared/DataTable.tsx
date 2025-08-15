import React, { useState } from 'react';
import ClickableStatusDropdown from './ClickableStatusDropdown';
import ValidatedInput from './ValidatedInput';
import './DataTable.css';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  editable?: boolean;
  enumValues?: string[]; // Added for enum fields with predefined options
  searchableOptions?: { value: string; label: string }[]; // Added for searchable dropdowns
  clickableDropdown?: boolean; // Added for clickable status dropdowns
  onDropdownChange?: (value: string, row: any) => void; // Callback for dropdown changes
  validatedInput?: boolean; // Added for validated input fields (replaces dropdowns)
  onValidatedChange?: (value: string, row: any) => void; // Callback for validated input changes
  sortable?: boolean; // Added for sortable columns
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onSave?: (row: any, updatedData: any) => Promise<void>;
  onDelete?: (row: any) => Promise<void>;
  onRestore?: (row: any) => Promise<void>;
  isLoading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
  // Pagination configuration
  pagination?: {
    enabled: boolean;
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  // Status column configuration
  statusColumn?: {
    enabled: boolean;
    entityType: 'user' | 'client' | 'meeting' | 'expense' | 'source' | 'type';
    statusKey: string; // The key in the data object that contains the status
    onStatusChange?: (entityId: number | string, newStatus: boolean | string) => void;
  };
  // Activity status column configuration (for soft delete)
  activityStatusColumn?: {
    enabled: boolean;
    entityType: 'user' | 'client' | 'meeting' | 'expense' | 'source' | 'type';
    activityStatusKey: string; // The key in the data object that contains the activity status
    onActivityStatusChange?: (entityId: number | string, newStatus: boolean) => void;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onSave,
  onDelete,
  onRestore,
  isLoading = false,
  selectable = false,
  onSelectionChange,
  pagination,
  statusColumn,
  activityStatusColumn
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleEdit = (rowIndex: number, row: any) => {
    setEditingRow(rowIndex);
    setEditingData({ ...row });
  };

  const handleSave = async (rowIndex: number) => {
    if (!onSave) return;
    
    setSavingRow(rowIndex);
    try {
      await onSave(data[rowIndex], editingData);
      // Update the local data to reflect changes
      data[rowIndex] = { ...data[rowIndex], ...editingData };
      setEditingRow(null);
      setEditingData({});
    } catch (error) {
      console.error('Failed to save:', error);
      // Keep editing state on error
    } finally {
      setSavingRow(null);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditingData({});
  };

  const handleRowSelection = (rowId: number, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(row => row.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };
  
  // Sorting handlers
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };
  
  // Sort data based on current sort state
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle status column sorting (statusColumn and activityStatusColumn)
      if (sortColumn === 'status' && statusColumn?.enabled) {
        aValue = a[statusColumn.statusKey];
        bValue = b[statusColumn.statusKey];
      } else if (sortColumn === 'activityStatus' && activityStatusColumn?.enabled) {
        aValue = a[activityStatusColumn.activityStatusKey];
        bValue = b[activityStatusColumn.activityStatusKey];
      }
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      
      // Default string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.toLowerCase().localeCompare(bStr.toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, statusColumn, activityStatusColumn]);
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {/* Pagination Controls */}
      {pagination?.enabled && (
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} of {pagination.totalElements} entries</span>
          </div>
          
          <div className="pagination-controls-right">
            {/* Page Size Selector */}
            <div className="page-size-selector">
              <label htmlFor="page-size">Show:</label>
              <select
                id="page-size"
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
              <span>entries</span>
            </div>
            
            {/* Page Navigation */}
            <div className="page-navigation">
              <button
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage === 1}
                title="First page"
              >
                «
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                title="Previous page"
              >
                ‹
              </button>
              
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                title="Next page"
              >
                ›
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
      
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ 
                background: '#f8f9fa', 
                padding: '6px 4px', 
                textAlign: 'center', 
                fontWeight: 600, 
                color: '#495057', 
                borderBottom: '2px solid #dee2e6', 
                fontSize: '13px', 
                lineHeight: 1.1,
                width: '40px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key} style={{ 
                background: '#f8f9fa', 
                padding: '6px 4px', 
                textAlign: 'center', 
                fontWeight: 600, 
                color: '#495057', 
                borderBottom: '2px solid #dee2e6', 
                fontSize: '13px', 
                lineHeight: 1.1,
                cursor: column.sortable !== false ? 'pointer' : 'default',
                userSelect: 'none'
              }} 
              onClick={() => column.sortable !== false && handleSort(column.key)}
              title={column.sortable !== false ? `Click to sort by ${column.label}` : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>{column.label}</span>
                  {column.sortable !== false && sortColumn === column.key && (
                    <span style={{ fontSize: '12px', color: '#007bff' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {statusColumn?.enabled && (
              <th style={{ 
                background: '#f8f9fa', 
                padding: '6px 4px', 
                textAlign: 'center', 
                fontWeight: 600, 
                color: '#495057', 
                borderBottom: '2px solid #dee2e6', 
                fontSize: '13px', 
                lineHeight: '1.1',
                cursor: 'pointer',
                userSelect: 'none'
              }} 
              onClick={() => handleSort('status')}
              title="Click to sort by Status"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>Status</span>
                  {sortColumn === 'status' && (
                    <span style={{ fontSize: '12px', color: '#007bff' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            )}
            {activityStatusColumn?.enabled && (
              <th style={{ 
                background: '#f8f9fa', 
                padding: '6px 4px', 
                textAlign: 'center', 
                fontWeight: 600, 
                color: '#495057', 
                borderBottom: '2px solid #dee2e6', 
                fontSize: '13px', 
                lineHeight: '1.1',
                cursor: 'pointer',
                userSelect: 'none'
              }} 
              onClick={() => handleSort('activityStatus')}
              title="Click to sort by Activity Status"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>Activity Status</span>
                  {sortColumn === 'activityStatus' && (
                    <span style={{ fontSize: '12px', color: '#007bff' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={row.id || index} className="data-row">
              {selectable && (
                <td style={{
                  padding: '4px 4px',
                  borderBottom: '1px solid #e9ecef',
                  textAlign: 'center',
                  width: '40px'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={(e) => handleRowSelection(row.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} style={{
                  padding: '4px 4px',
                  borderBottom: '1px solid #e9ecef',
                  color: '#212529',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                  lineHeight: 1.1,
                  textAlign: 'center'
                }}>
                  {editingRow === index ? (
                    <div className="inline-edit-container">
                      {column.enumValues ? (
                        <select
                          value={editingData[column.key] || ''}
                          onChange={(e) => setEditingData({
                            ...editingData,
                            [column.key]: e.target.value
                          })}
                          className="inline-edit-select"
                          disabled={savingRow === index}
                        >
                          <option value="">Select...</option>
                          {column.enumValues.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editingData[column.key] || ''}
                          onChange={(e) => setEditingData({
                            ...editingData,
                            [column.key]: e.target.value
                          })}
                          className="inline-edit-input"
                          disabled={savingRow === index}
                        />
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => column.editable !== false && handleEdit(index, row)}
                      className={`inline-edit-field ${column.editable !== false ? 'editable' : ''}`}
                      title={column.editable !== false ? "Click to edit" : ""}
                    >
                      {column.validatedInput ? (
                        <ValidatedInput
                          value={row[column.key] || ''}
                          onChange={(value) => column.onValidatedChange?.(value, row)}
                          placeholder={`Enter ${column.label.toLowerCase()}...`}
                          onValidationResult={(isValid, message) => {
                            // Handle validation result if needed
                            console.log(`Validation for ${column.key}:`, isValid, message);
                          }}
                        />
                      ) : column.clickableDropdown && column.enumValues ? (
                        <select
                          value={row[column.key] || ''}
                          onChange={(e) => column.onDropdownChange?.(e.target.value, row)}
                          className="clickable-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {column.enumValues.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : column.clickableDropdown && column.searchableOptions ? (
                        <select
                          value={row[column.key] || ''}
                          onChange={(e) => column.onDropdownChange?.(e.target.value, row)}
                          className="clickable-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select...</option>
                          {column.searchableOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'
                      }
                    </div>
                  )}
                </td>
              ))}
              {statusColumn?.enabled && (
                <td style={{
                  padding: '4px 4px',
                  borderBottom: '1px solid #e9ecef',
                  color: '#212529',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                  lineHeight: '1.1',
                  textAlign: 'center'
                }}>
                  {editingRow === index ? (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleSave(index)}
                        disabled={savingRow === index}
                        style={{
                          padding: '4px 8px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        title="Save all changes"
                      >
                        {savingRow === index ? '⏳' : 'Save All'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={savingRow === index}
                        style={{
                          padding: '4px 8px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        title="Cancel editing"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                      <ClickableStatusDropdown
                        currentStatus={row[statusColumn.statusKey]}
                        onStatusChange={(newStatus) => statusColumn.onStatusChange?.(row.id, newStatus)}
                        entityId={row.id}
                        entityType={statusColumn.entityType}
                      />
                      {/* Delete button removed - not needed in status column */}
                    </div>
                  )}
                </td>
              )}
              {activityStatusColumn?.enabled && (
                <td style={{
                  padding: '4px 4px',
                  borderBottom: '1px solid #e9ecef',
                  color: '#212529',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                  lineHeight: '1.1',
                  textAlign: 'center'
                }}>
                  <ClickableStatusDropdown
                    currentStatus={row[activityStatusColumn.activityStatusKey] || true}
                    onStatusChange={(newStatus) => activityStatusColumn.onActivityStatusChange?.(row.id, newStatus as boolean)}
                    entityId={row.id}
                    entityType={activityStatusColumn.entityType}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 