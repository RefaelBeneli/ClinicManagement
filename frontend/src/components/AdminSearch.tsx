import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AdminSearch.css';

export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'number';
  options?: { value: string; label: string; }[];
  value: any;
  placeholder?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Record<string, any>;
  isDefault?: boolean;
}

interface AdminSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: SearchFilter[];
  onFilterChange: (filterId: string, value: any) => void;
  filterPresets?: FilterPreset[];
  onPresetApply?: (preset: FilterPreset) => void;
  onPresetSave?: (name: string, description: string, filters: Record<string, any>) => void;
  onPresetDelete?: (presetId: string) => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
  resultCount?: number;
  isLoading?: boolean;
}

const AdminSearch: React.FC<AdminSearchProps> = ({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  filterPresets = [],
  onPresetApply,
  onPresetSave,
  onPresetDelete,
  suggestions = [],
  onSuggestionSelect,
  placeholder = "Search across all admin sections...",
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  resultCount,
  isLoading = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search value
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase()) && 
    suggestion.toLowerCase() !== searchValue.toLowerCase()
  ).slice(0, 8);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
    setFocusedSuggestionIndex(-1);
  };

  // Handle keyboard navigation in search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedSuggestionIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[focusedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    searchInputRef.current?.focus();
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any) => {
    onFilterChange(filterId, value);
  };

  // Handle preset application
  const handlePresetApply = (preset: FilterPreset) => {
    if (onPresetApply) {
      onPresetApply(preset);
    }
  };

  // Handle preset saving
  const handlePresetSave = () => {
    if (presetName.trim() && onPresetSave) {
      const currentFilters: Record<string, any> = {};
      filters.forEach(filter => {
        if (filter.value !== undefined && filter.value !== '' && filter.value !== null) {
          currentFilters[filter.id] = filter.value;
        }
      });
      
      onPresetSave(presetName.trim(), presetDescription.trim(), currentFilters);
      setPresetName('');
      setPresetDescription('');
      setShowPresetModal(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    filters.forEach(filter => {
      handleFilterChange(filter.id, filter.type === 'boolean' ? false : '');
    });
    onSearchChange('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchValue.length > 0 || filters.some(filter => {
    if (filter.type === 'boolean') return filter.value === true;
    return filter.value !== undefined && filter.value !== '' && filter.value !== null;
  });

  const renderFilterInput = (filter: SearchFilter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-select"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filter.value || false}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
            />
            <span className="checkbox-label">{filter.label}</span>
          </label>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-date"
            placeholder={filter.placeholder}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-number"
            placeholder={filter.placeholder}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-text"
            placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="admin-search">
      {/* Main Search Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowSuggestions(searchValue.length > 0 && filteredSuggestions.length > 0)}
            className="search-input"
            placeholder={placeholder}
            aria-label="Global search"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          />
          {isLoading && (
            <div className="search-loading" aria-label="Searching...">
              <div className="search-spinner"></div>
            </div>
          )}
          {searchValue && (
            <button
              className="search-clear"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="search-suggestions" role="listbox">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                className={`suggestion-item ${index === focusedSuggestionIndex ? 'focused' : ''}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                role="option"
                aria-selected={index === focusedSuggestionIndex}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-text">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Actions */}
      <div className="search-actions">
        {onToggleAdvancedFilters && (
          <button
            className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={onToggleAdvancedFilters}
            title="Toggle advanced filters"
          >
            🔧 Filters
          </button>
        )}
        
        {resultCount !== undefined && (
          <span className="result-count">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        )}
        
        {hasActiveFilters && (
          <button
            className="clear-filters"
            onClick={handleClearFilters}
            title="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filters-header">
            <h4>Advanced Filters</h4>
            <div className="filter-presets">
              {filterPresets.length > 0 && (
                <select
                  onChange={(e) => {
                    const preset = filterPresets.find(p => p.id === e.target.value);
                    if (preset) handlePresetApply(preset);
                  }}
                  className="preset-select"
                >
                  <option value="">Select preset...</option>
                  {filterPresets.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              )}
              {onPresetSave && (
                <button
                  className="save-preset-btn"
                  onClick={() => setShowPresetModal(true)}
                  title="Save current filters as preset"
                >
                  💾 Save Preset
                </button>
              )}
            </div>
          </div>

          <div className="filters-grid">
            {filters.map(filter => (
              <div key={filter.id} className="filter-group">
                <label className="filter-label">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showPresetModal && (
        <div className="modal-overlay">
          <div className="preset-modal">
            <div className="modal-header">
              <h3>Save Filter Preset</h3>
              <button
                className="modal-close"
                onClick={() => setShowPresetModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="preset-name">Preset Name</label>
                <input
                  id="preset-name"
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="preset-description">Description (optional)</label>
                <textarea
                  id="preset-description"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Describe what this preset filters for"
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowPresetModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handlePresetSave}
                disabled={!presetName.trim()}
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSearch; 