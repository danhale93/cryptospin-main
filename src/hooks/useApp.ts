"use client";

import { useState, useCallback } from 'react';

export const useApp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const refreshAllData = useCallback(() => {
    // This will be handled by individual components
    console.log('Refreshing all data...');
  }, []);

  return {
    isLoading,
    setLoading,
    refreshAllData
  };
};