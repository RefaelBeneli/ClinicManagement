import React from 'react';
import './SearchFilter.css';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`search-filter-container ${className}`}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {value && (
          <button
            className="clear-search-btn"
            onClick={() => onChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter; 