import React, { useState, useCallback } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
      setIsSearching(false);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsSearching(true);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsSearching(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setIsSearching(false);
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <div className={styles.searchInput}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.input}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {isSearching && (
          <div className={styles.loadingIndicator}>
            <span className={styles.spinner}></span>
          </div>
        )}
      </div>
    </form>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SearchBar; 