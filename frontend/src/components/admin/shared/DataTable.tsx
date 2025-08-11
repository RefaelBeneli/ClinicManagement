import React, { useState } from 'react';
import ClickableStatusDropdown from './ClickableStatusDropdown';
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
  statusColumn,
  activityStatusColumn
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

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
                lineHeight: 1.1 
              }}>{column.label}</th>
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
                lineHeight: '1.1' 
              }}>Status</th>
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
                lineHeight: '1.1' 
              }}>Activity Status</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
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
                      {column.clickableDropdown && column.enumValues ? (
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