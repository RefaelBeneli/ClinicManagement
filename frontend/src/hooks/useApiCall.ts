import { useRef } from 'react';

// Global cache to track API calls across all components
const apiCallCache = new Map<string, boolean>();

export const useApiCall = () => {
  const componentRef = useRef<string>(`component-${Math.random()}`);

  const makeApiCall = async <T>(
    endpoint: string,
    apiFunction: () => Promise<T>,
    options?: {
      forceRefresh?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> => {
    const cacheKey = options?.cacheKey || endpoint;
    
    // Check if this API call has already been made
    if (!options?.forceRefresh && apiCallCache.has(cacheKey)) {
      console.log(`🔄 Skipping duplicate API call to: ${endpoint}`);
      // Return a resolved promise to maintain the same interface
      return Promise.resolve() as T;
    }

    // Mark this API call as made
    apiCallCache.set(cacheKey, true);
    console.log(`📡 Making API call to: ${endpoint}`);
    
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      // Remove from cache on error so it can be retried
      apiCallCache.delete(cacheKey);
      throw error;
    }
  };

  const clearCache = (endpoint?: string) => {
    if (endpoint) {
      apiCallCache.delete(endpoint);
    } else {
      apiCallCache.clear();
    }
  };

  return {
    makeApiCall,
    clearCache,
    componentRef: componentRef.current
  };
};
