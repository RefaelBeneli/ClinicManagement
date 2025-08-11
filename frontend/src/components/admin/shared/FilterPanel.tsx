import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: string[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFiltersChange: (filters: Record<string, any>) => void;
  onBulkAction?: (action: string, selectedIds: number[]) => void;
  selectedRows?: number[];
  totalRows?: number;
  bulkActions?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onBulkAction,
  selectedRows = [],
  totalRows = 0,
  bulkActions = ['Delete', 'Export', 'Update Status']
}) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(true);
  const [selectedBulkAction, setSelectedBulkAction] = useState('');

  useEffect(() => {
    onFiltersChange(filterValues);
  }, [filterValues, onFiltersChange]);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilterValues({});
  };

  const handleBulkAction = () => {
    if (selectedBulkAction && selectedRows.length > 0 && onBulkAction) {
      onBulkAction(selectedBulkAction, selectedRows);
      setSelectedBulkAction('');
    }
  };

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-select"
          >
            <option value="">{filter.placeholder || `Select ${filter.label}`}</option>
            {filter.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
            placeholder={filter.placeholder}
          />
        );
      
      case 'boolean':
        return (
          <select
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="filter-input"
            placeholder={filter.placeholder || `Filter by ${filter.label}`}
          />
        );
    }
  };

  const activeFiltersCount = Object.values(filterValues).filter(v => v !== '' && v !== null && v !== undefined).length;

  return (
    <div className="filter-panel">
      {/* Filter Toggle and Bulk Actions Header */}
      <div className="filter-header">
        <div className="filter-controls">
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Bulk Operations */}
        {onBulkAction && selectedRows.length > 0 && (
          <div className="bulk-operations">
            <span className="bulk-selection-info">
              {selectedRows.length} of {totalRows} selected
            </span>
            <select
              value={selectedBulkAction}
              onChange={(e) => setSelectedBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Choose Action</option>
              {bulkActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <button
              className="bulk-action-btn"
              onClick={handleBulkAction}
              disabled={!selectedBulkAction}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="filter-options">
          <div className="filter-grid">
            {filters.map(filter => (
              <div key={filter.key} className="filter-item">
                <label className="filter-label">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 